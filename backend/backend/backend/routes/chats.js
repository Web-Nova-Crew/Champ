const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserChats,
  getChatMessages,
  createChat,
  sendMessage,
} = require('../config/database');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { emitNewMessage } = require('../services/socket');

// Use admin client for all operations to bypass RLS
const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/chats
 * @desc    Get user chats
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await getUserChats(req.userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   POST /api/chats
 * @desc    Create new chat
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { participant2Id, propertyId } = req.body;

    if (!participant2Id || !propertyId) {
      return res.status(400).json({
        success: false,
        error: 'Participant ID and Property ID required',
      });
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('title, owner_id, owner_name')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    // Get participant names
    const { data: user1 } = await supabase
      .from('users')
      .select('name')
      .eq('id', req.userId)
      .single();

    const { data: user2 } = await supabase
      .from('users')
      .select('name')
      .eq('id', participant2Id)
      .single();

    const chatData = {
      participant1_id: req.userId,
      participant1_name: user1?.name || 'Unknown',
      participant2_id: participant2Id,
      participant2_name: user2?.name || 'Unknown',
      property_id: propertyId,
      property_title: property.title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await createChat(chatData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/chats/:chatId/messages
 * @desc    Get chat messages
 * @access  Private
 */
router.get('/:chatId/messages', authenticate, async (req, res) => {
  try {
    // Verify user is participant in chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', req.params.chatId)
      .single();

    if (chatError || !chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found',
      });
    }

    if (chat.participant1_id !== req.userId && chat.participant2_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this chat',
      });
    }

    const result = await getChatMessages(req.params.chatId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   POST /api/chats/:chatId/messages
 * @desc    Send message
 * @access  Private
 */
router.post('/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content required',
      });
    }

    // Verify user is participant in chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', req.params.chatId)
      .single();

    if (chatError || !chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found',
      });
    }

    if (chat.participant1_id !== req.userId && chat.participant2_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this chat',
      });
    }

    // Get sender name
    const { data: sender } = await supabase
      .from('users')
      .select('name')
      .eq('id', req.userId)
      .single();

    const messageData = {
      chat_id: req.params.chatId,
      sender_id: req.userId,
      sender_name: sender?.name || 'Unknown',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    const result = await sendMessage(messageData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Emit real-time message to chat participants
    try {
      emitNewMessage(req.params.chatId, result.data);
    } catch (socketError) {
      console.log('Socket.IO not available, message sent via API only');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/chats/contact/:propertyId
 * @desc    Get property owner contact info for messaging/WhatsApp
 * @access  Private
 */
router.get('/contact/:propertyId', authenticate, async (req, res) => {
  try {
    const dbClient = getDbClient();
    
    // Get property with owner info
    const { data: properties, error: propertyError } = await dbClient
      .from('properties')
      .select('id, title, owner_id, owner_name, owner_phone')
      .eq('id', req.params.propertyId);

    if (propertyError || !properties || properties.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    const property = properties[0];

    // Get owner's user profile for additional info
    const { data: ownerProfiles } = await dbClient
      .from('users')
      .select('id, name, phone, email')
      .eq('id', property.owner_id);

    const owner = ownerProfiles && ownerProfiles.length > 0 ? ownerProfiles[0] : null;
    const phone = property.owner_phone || owner?.phone || '';
    
    // Format phone for WhatsApp (remove spaces, add country code if needed)
    let whatsappNumber = phone.replace(/[\s\-\(\)]/g, '');
    if (whatsappNumber.startsWith('0')) {
      whatsappNumber = '91' + whatsappNumber.substring(1); // India country code
    } else if (!whatsappNumber.startsWith('+') && !whatsappNumber.startsWith('91')) {
      whatsappNumber = '91' + whatsappNumber;
    }
    whatsappNumber = whatsappNumber.replace('+', '');

    // Create WhatsApp message
    const whatsappMessage = encodeURIComponent(
      `Hi! I'm interested in your property "${property.title}" listed on Estato. Can we discuss?`
    );

    res.json({
      success: true,
      data: {
        propertyId: property.id,
        propertyTitle: property.title,
        ownerId: property.owner_id,
        ownerName: property.owner_name || owner?.name || 'Property Owner',
        ownerPhone: phone,
        ownerEmail: owner?.email || null,
        whatsappLink: phone ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}` : null,
        canMessage: true,
      },
    });
  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   POST /api/chats/start/:propertyId
 * @desc    Start a chat with property owner
 * @access  Private
 */
router.post('/start/:propertyId', authenticate, async (req, res) => {
  try {
    const dbClient = getDbClient();
    const { message } = req.body;
    
    // Get property with owner info
    const { data: properties, error: propertyError } = await dbClient
      .from('properties')
      .select('id, title, owner_id, owner_name')
      .eq('id', req.params.propertyId);

    if (propertyError || !properties || properties.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    const property = properties[0];

    // Can't message yourself
    if (property.owner_id === req.userId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot message yourself',
      });
    }

    // Check if chat already exists
    const { data: existingChats } = await dbClient
      .from('chats')
      .select('id')
      .eq('property_id', req.params.propertyId)
      .or(`and(participant1_id.eq.${req.userId},participant2_id.eq.${property.owner_id}),and(participant1_id.eq.${property.owner_id},participant2_id.eq.${req.userId})`);

    if (existingChats && existingChats.length > 0) {
      // Chat exists, just send the message if provided
      if (message) {
        const { data: sender } = await dbClient
          .from('users')
          .select('name')
          .eq('id', req.userId);

        const messageData = {
          chat_id: existingChats[0].id,
          sender_id: req.userId,
          sender_name: sender && sender.length > 0 ? sender[0].name : 'Unknown',
          content: message.trim(),
          created_at: new Date().toISOString(),
        };

        await sendMessage(messageData);
      }

      return res.json({
        success: true,
        message: 'Chat already exists',
        data: { chatId: existingChats[0].id },
        existing: true,
      });
    }

    // Get user names
    const { data: user1 } = await dbClient
      .from('users')
      .select('name')
      .eq('id', req.userId);

    // Create new chat
    const chatData = {
      participant1_id: req.userId,
      participant1_name: user1 && user1.length > 0 ? user1[0].name : 'Unknown',
      participant2_id: property.owner_id,
      participant2_name: property.owner_name || 'Property Owner',
      property_id: property.id,
      property_title: property.title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newChat, error: chatError } = await dbClient
      .from('chats')
      .insert([chatData])
      .select();

    if (chatError) {
      return res.status(400).json({
        success: false,
        error: chatError.message,
      });
    }

    const chat = newChat && newChat.length > 0 ? newChat[0] : null;

    // Send initial message if provided
    if (message && chat) {
      const messageData = {
        chat_id: chat.id,
        sender_id: req.userId,
        sender_name: chatData.participant1_name,
        content: message.trim(),
        created_at: new Date().toISOString(),
      };

      await sendMessage(messageData);
    }

    res.status(201).json({
      success: true,
      message: 'Chat started successfully',
      data: { chatId: chat?.id, chat },
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

module.exports = router;

