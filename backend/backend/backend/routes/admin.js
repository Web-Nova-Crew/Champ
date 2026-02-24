const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

// Use admin client for all operations to bypass RLS
const getDbClient = () => supabaseAdmin || supabase;

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard stats
 * @access  Private (Admin only)
 */
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total properties
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    // Get pending properties
    const { count: pendingProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        pendingProperties: pendingProperties || 0,
        totalRevenue: totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/admin/properties
 * @desc    Get all properties (with filters)
 * @access  Private (Admin only)
 */
router.get('/properties', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = supabase.from('properties').select('*');

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data: properties, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/properties/:id/approve
 * @desc    Approve property listing
 * @access  Private (Admin only)
 */
router.put('/properties/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    
    const { data, error } = await dbClient
      .from('properties')
      .update({
        status: 'approved',
        admin_comment: null,
        reviewed_by: req.userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Property approved successfully',
      data: data && data.length > 0 ? data[0] : null,
    });
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/properties/:id/reject
 * @desc    Reject property listing
 * @access  Private (Admin only)
 */
router.put('/properties/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const dbClient = getDbClient();
    
    const { data, error } = await dbClient
      .from('properties')
      .update({
        status: 'rejected',
        admin_comment: reason || null,
        reviewed_by: req.userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Property rejected',
      data: data && data.length > 0 ? data[0] : null,
    });
  } catch (error) {
    console.error('Reject property error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/properties/:id/comment
 * @desc    Add admin comment/feedback for improvement
 * @access  Private (Admin only)
 */
router.put('/properties/:id/comment', authenticate, requireAdmin, async (req, res) => {
  try {
    const { comment, status } = req.body;
    const dbClient = getDbClient();
    
    const updateData = {
      admin_comment: comment,
      reviewed_by: req.userId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Optionally update status (e.g., 'needs_revision')
    if (status) {
      updateData.status = status;
    }
    
    const { data, error } = await dbClient
      .from('properties')
      .update(updateData)
      .eq('id', req.params.id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: data && data.length > 0 ? data[0] : null,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/admin/agents
 * @desc    Get all agents (pending approval)
 * @access  Private (Admin only)
 */
router.get('/agents', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: agents, error } = await supabase
      .from('users')
      .select('*')
      .in('user_type', ['agent', 'landlord', 'owner'])
      .eq('verified', false)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/verify
 * @desc    Verify user
 * @access  Private (Admin only)
 */
router.put('/users/:id/verify', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'User verified successfully',
      data,
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/agents/:id/approve
 * @desc    Approve agent
 * @access  Private (Admin only)
 */
router.put('/agents/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Agent approved successfully',
      data,
    });
  } catch (error) {
    console.error('Approve agent error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/admin/reports
 * @desc    Get all reports
 * @access  Private (Admin only)
 */
router.get('/reports', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/reports/:id/resolve
 * @desc    Resolve report
 * @access  Private (Admin only)
 */
router.put('/reports/:id/resolve', authenticate, requireAdmin, async (req, res) => {
  try {
    const { resolution_notes } = req.body;
    const { data, error } = await supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolution_notes: resolution_notes || null,
        resolved_at: new Date().toISOString(),
        resolved_by: req.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Report resolved successfully',
      data,
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/reports/:id/dismiss
 * @desc    Dismiss report
 * @access  Private (Admin only)
 */
router.put('/reports/:id/dismiss', authenticate, requireAdmin, async (req, res) => {
  try {
    const { resolution_notes } = req.body;
    const { data, error } = await supabase
      .from('reports')
      .update({
        status: 'dismissed',
        resolution_notes: resolution_notes || null,
        resolved_at: new Date().toISOString(),
        resolved_by: req.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Report dismissed',
      data,
    });
  } catch (error) {
    console.error('Dismiss report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings
 * @access  Private (Admin only)
 */
router.get('/bookings', authenticate, requireAdmin, async (req, res) => {
  try {
    let query = supabase.from('bookings').select('*');

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data: bookings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Admin only)
 */
router.put('/bookings/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: `Booking ${status}`,
      data,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/suspend
 * @desc    Suspend user
 * @access  Private (Admin only)
 */
router.put('/users/:id/suspend', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'User suspended',
      data,
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/activate
 * @desc    Activate user
 * @access  Private (Admin only)
 */
router.put('/users/:id/activate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'User activated',
      data,
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.put('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'admin', 'agent', 'landlord', 'owner'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   DELETE /api/admin/properties/:id
 * @desc    Delete property
 * @access  Private (Admin only)
 */
router.delete('/properties/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    
    const { error } = await dbClient
      .from('properties')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Delete property error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/properties/:id/status
 * @desc    Update property status
 * @access  Private (Admin only)
 */
router.put('/properties/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'active', 'rejected', 'sold', 'rented'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    const { data, error } = await supabase
      .from('properties')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: `Property status updated to ${status}`,
      data,
    });
  } catch (error) {
    console.error('Update property status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get comprehensive admin stats
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get all counts in parallel
    const [
      usersCount,
      propertiesCount,
      pendingPropertiesCount,
      activePropertiesCount,
      agentsCount,
      pendingAgentsCount,
      bookingsCount,
      todayBookingsCount,
      reportsCount,
      openReportsCount,
      paymentsData,
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('properties').select('*', { count: 'exact', head: true }).in('status', ['active', 'approved']),
      supabase.from('users').select('*', { count: 'exact', head: true }).in('user_type', ['agent', 'landlord', 'owner']),
      supabase.from('users').select('*', { count: 'exact', head: true }).in('user_type', ['agent', 'landlord', 'owner']).eq('verified', false),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['pending', 'investigating']),
      supabase.from('payments').select('amount').eq('status', 'completed'),
    ]);

    const totalRevenue = paymentsData.data?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        totalUsers: usersCount.count || 0,
        totalProperties: propertiesCount.count || 0,
        pendingProperties: pendingPropertiesCount.count || 0,
        activeProperties: activePropertiesCount.count || 0,
        totalAgents: agentsCount.count || 0,
        pendingAgents: pendingAgentsCount.count || 0,
        totalBookings: bookingsCount.count || 0,
        todayBookings: todayBookingsCount.count || 0,
        totalReports: reportsCount.count || 0,
        openReports: openReportsCount.count || 0,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/admin/agents/:id/reject
 * @desc    Reject agent
 * @access  Private (Admin only)
 */
router.put('/agents/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const { data, error } = await supabase
      .from('users')
      .update({
        status: 'rejected',
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Agent rejected',
      data,
    });
  } catch (error) {
    console.error('Reject agent error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/admin/analytics
 * @desc    Get comprehensive analytics data
 * @access  Private (Admin only)
 */
router.get('/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '30d': startDate.setDate(now.getDate() - 30); break;
      case '90d': startDate.setDate(now.getDate() - 90); break;
      case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate.setDate(now.getDate() - 30);
    }

    // Get all data in parallel
    const [
      usersData,
      propertiesData,
      bookingsData,
      paymentsData,
      recentUsersData,
      recentPropertiesData,
    ] = await Promise.all([
      dbClient.from('users').select('id, created_at, user_type'),
      dbClient.from('properties').select('id, property_type, location, views, status, created_at'),
      dbClient.from('bookings').select('id, created_at, status'),
      dbClient.from('payments').select('amount, status, created_at'),
      dbClient.from('users').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(10),
      dbClient.from('properties').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(10),
    ]);

    const users = usersData.data || [];
    const properties = propertiesData.data || [];
    const bookings = bookingsData.data || [];
    const payments = paymentsData.data || [];

    // Calculate stats
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const conversionRate = users.length > 0 ? ((bookings.length / users.length) * 100).toFixed(1) : 0;

    // User growth by month (last 12 months)
    const userGrowth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const monthUsers = users.filter(u => {
        const created = new Date(u.created_at);
        return created <= monthEnd;
      }).length;
      userGrowth.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        users: monthUsers,
      });
    }

    // Property views by day (last 7 days)
    const propertyViews = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      // Simulate daily views based on total views
      const dailyViews = Math.floor(totalViews / 30 * (0.8 + Math.random() * 0.4));
      propertyViews.push({ day: dayName, views: dailyViews || Math.floor(Math.random() * 100) });
    }

    // Property types distribution
    const typeCount = {};
    properties.forEach(p => {
      const type = p.property_type || 'Other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    const propertyTypes = Object.entries(typeCount).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: properties.length > 0 ? Math.round((count / properties.length) * 100) : 0,
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Top locations
    const locationCount = {};
    const locationViews = {};
    properties.forEach(p => {
      const loc = p.location || 'Unknown';
      locationCount[loc] = (locationCount[loc] || 0) + 1;
      locationViews[loc] = (locationViews[loc] || 0) + (p.views || 0);
    });
    const topLocations = Object.entries(locationCount)
      .map(([location, count]) => ({
        location,
        properties: count,
        views: locationViews[location] || 0,
      }))
      .sort((a, b) => b.properties - a.properties)
      .slice(0, 5);

    // Recent activity
    const recentActivity = [];
    
    // Add recent users
    (recentUsersData.data || []).slice(0, 3).forEach(u => {
      recentActivity.push({
        type: 'user',
        message: `New user registered: ${u.name || u.email}`,
        time: getTimeAgo(u.created_at),
        created_at: u.created_at,
      });
    });
    
    // Add recent properties
    (recentPropertiesData.data || []).slice(0, 3).forEach(p => {
      recentActivity.push({
        type: 'property',
        message: `Property ${p.status === 'pending' ? 'submitted' : 'listed'}: ${p.title}`,
        time: getTimeAgo(p.created_at),
        created_at: p.created_at,
      });
    });
    
    // Sort by time and take top 5
    recentActivity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: {
        stats: {
          totalViews,
          totalUsers: users.length,
          totalProperties: properties.length,
          totalBookings: bookings.length,
          revenue: totalRevenue,
          conversionRate: parseFloat(conversionRate),
        },
        charts: {
          userGrowth,
          propertyViews,
          propertyTypes,
          topLocations,
          recentActivity: recentActivity.slice(0, 5),
        },
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// Helper function to get time ago string
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

/**
 * @route   POST /api/admin/seed-properties
 * @desc    Seed sample Lucknow properties for demo
 * @access  Private (Admin only)
 */
router.post('/seed-properties', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();

    const sampleProperties = [
      {
        title: 'Luxury 4 BHK Villa in Gomti Nagar',
        description: 'Stunning 4 BHK independent villa in the heart of Gomti Nagar. Features include Italian marble flooring, modular kitchen, home theater, private garden, and covered parking for 3 cars.',
        price: 25000000,
        property_type: 'Villa',
        transaction_type: 'Buy',
        location: 'Gomti Nagar Extension, Near Phoenix Palassio',
        area: 'Gomti Nagar',
        size: 3500,
        bedrooms: 4,
        bathrooms: 5,
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
        owner_name: 'Rajesh Sharma',
        owner_phone: '9876543210',
        amenities: ['Swimming Pool', 'Gym', 'Garden', 'Parking', 'Security', 'Power Backup'],
        is_furnished: true,
        year_built: 2022,
        latitude: 26.8567,
        longitude: 81.0250,
        is_featured: true,
        status: 'approved',
      },
      {
        title: 'Modern 3 BHK Apartment in Hazratganj',
        description: 'Premium 3 BHK apartment in the iconic Hazratganj area. Fully furnished with branded furniture, split ACs in all rooms, and modular kitchen.',
        price: 12500000,
        property_type: 'Apartment',
        transaction_type: 'Buy',
        location: 'Hazratganj, Near Sahara Ganj Mall',
        area: 'Hazratganj',
        size: 1800,
        bedrooms: 3,
        bathrooms: 3,
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
        owner_name: 'Priya Verma',
        owner_phone: '9876543211',
        amenities: ['Lift', 'Parking', 'Security', 'Power Backup', 'Gym'],
        is_furnished: true,
        year_built: 2021,
        latitude: 26.8489,
        longitude: 80.9465,
        is_featured: true,
        status: 'approved',
      },
      {
        title: 'Spacious 3 BHK Flat for Rent in Indira Nagar',
        description: 'Well-maintained 3 BHK flat available for rent in Indira Nagar. Semi-furnished with wardrobes and modular kitchen.',
        price: 25000,
        property_type: 'Apartment',
        transaction_type: 'Rent',
        location: 'Indira Nagar, Sector 21',
        area: 'Indira Nagar',
        size: 1500,
        bedrooms: 3,
        bathrooms: 2,
        images: ['https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'],
        owner_name: 'Amit Kumar',
        owner_phone: '9876543212',
        amenities: ['Parking', 'Security', 'Power Backup', 'Water Supply'],
        is_furnished: false,
        year_built: 2018,
        latitude: 26.8722,
        longitude: 80.9911,
        is_featured: true,
        status: 'approved',
      },
      {
        title: 'Premium Penthouse in Sushant Golf City',
        description: 'Exclusive 5 BHK penthouse with breathtaking views of the golf course. Features include private terrace, jacuzzi, and home automation.',
        price: 45000000,
        property_type: 'Penthouse',
        transaction_type: 'Buy',
        location: 'Sushant Golf City, Ansal API',
        area: 'Sushant Golf City',
        size: 5500,
        bedrooms: 5,
        bathrooms: 6,
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800'],
        owner_name: 'Vikram Singh',
        owner_phone: '9876543213',
        amenities: ['Private Terrace', 'Jacuzzi', 'Home Automation', 'Gym', 'Swimming Pool'],
        is_furnished: true,
        year_built: 2023,
        latitude: 26.7850,
        longitude: 81.0150,
        is_featured: true,
        status: 'approved',
      },
      {
        title: '2 BHK Affordable Flat in Jankipuram',
        description: 'Budget-friendly 2 BHK flat in Jankipuram. New construction with modern amenities. Near Lucknow Metro station.',
        price: 3500000,
        property_type: 'Apartment',
        transaction_type: 'Buy',
        location: 'Jankipuram, Near Metro Station',
        area: 'Jankipuram',
        size: 950,
        bedrooms: 2,
        bathrooms: 2,
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800'],
        owner_name: 'Sanjay Gupta',
        owner_phone: '9876543214',
        amenities: ['Lift', 'Parking', 'Security', 'Power Backup'],
        is_furnished: false,
        year_built: 2024,
        latitude: 26.9150,
        longitude: 80.9450,
        is_featured: false,
        status: 'approved',
      },
      {
        title: 'Commercial Shop in Aminabad Market',
        description: 'Prime commercial shop in the bustling Aminabad market. Ground floor with good frontage.',
        price: 8500000,
        property_type: 'Shop',
        transaction_type: 'Buy',
        location: 'Aminabad Market, Main Road',
        area: 'Aminabad',
        size: 450,
        bedrooms: 0,
        bathrooms: 1,
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'],
        owner_name: 'Mohammad Ali',
        owner_phone: '9876543215',
        amenities: ['Power Backup', 'Security', 'Water Supply'],
        is_furnished: false,
        year_built: 2015,
        latitude: 26.8450,
        longitude: 80.9350,
        is_featured: false,
        status: 'approved',
      },
      {
        title: 'Independent House in Aliganj',
        description: 'Beautiful 3 BHK independent house in Aliganj. Double story with lawn, garage, and servant quarter.',
        price: 9500000,
        property_type: 'House',
        transaction_type: 'Buy',
        location: 'Aliganj, Sector K',
        area: 'Aliganj',
        size: 2200,
        bedrooms: 3,
        bathrooms: 3,
        images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800'],
        owner_name: 'Neha Tripathi',
        owner_phone: '9876543216',
        amenities: ['Garden', 'Parking', 'Servant Quarter', 'Water Supply'],
        is_furnished: false,
        year_built: 2019,
        latitude: 26.8950,
        longitude: 80.9650,
        is_featured: true,
        status: 'approved',
      },
      {
        title: 'Studio Apartment for Rent in Gomti Nagar',
        description: 'Compact and modern studio apartment perfect for bachelors or students. Fully furnished with AC.',
        price: 12000,
        property_type: 'Studio',
        transaction_type: 'Rent',
        location: 'Gomti Nagar, Vibhuti Khand',
        area: 'Gomti Nagar',
        size: 450,
        bedrooms: 1,
        bathrooms: 1,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'],
        owner_name: 'Rahul Saxena',
        owner_phone: '9876543217',
        amenities: ['AC', 'WiFi', 'Security', 'Power Backup'],
        is_furnished: true,
        year_built: 2020,
        latitude: 26.8600,
        longitude: 81.0100,
        is_featured: false,
        status: 'approved',
      },
      {
        title: 'Residential Plot in Chinhat',
        description: 'Prime residential plot in developing Chinhat area. Clear title, all approvals in place.',
        price: 4500000,
        property_type: 'Plot',
        transaction_type: 'Buy',
        location: 'Chinhat, Near Highway',
        area: 'Chinhat',
        size: 2000,
        bedrooms: 0,
        bathrooms: 0,
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800'],
        owner_name: 'Deepak Yadav',
        owner_phone: '9876543218',
        amenities: ['Boundary Wall', 'Road Access', 'Electricity'],
        is_furnished: false,
        year_built: null,
        latitude: 26.8750,
        longitude: 81.0550,
        is_featured: false,
        status: 'approved',
      },
      {
        title: 'Office Space in Vibhuti Khand',
        description: 'Modern office space in prime IT corridor of Gomti Nagar. Plug and play setup with workstations.',
        price: 45000,
        property_type: 'Office Space',
        transaction_type: 'Rent',
        location: 'Vibhuti Khand, Gomti Nagar',
        area: 'Gomti Nagar',
        size: 1200,
        bedrooms: 0,
        bathrooms: 2,
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'],
        owner_name: 'Arun Mehta',
        owner_phone: '9876543220',
        amenities: ['AC', 'WiFi', 'Parking', 'Power Backup', 'Lift'],
        is_furnished: true,
        year_built: 2022,
        latitude: 26.8580,
        longitude: 81.0080,
        is_featured: true,
        status: 'approved',
      },
      {
        title: 'Luxury 3 BHK in Eldeco Udyan',
        description: 'Elegant 3 BHK apartment in the prestigious Eldeco Udyan township. Vastu compliant with garden view.',
        price: 11000000,
        property_type: 'Apartment',
        transaction_type: 'Buy',
        location: 'Eldeco Udyan, Raibareli Road',
        area: 'Raibareli Road',
        size: 1650,
        bedrooms: 3,
        bathrooms: 3,
        images: ['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'],
        owner_name: 'Kavita Agarwal',
        owner_phone: '9876543221',
        amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Tennis Court', 'Children Play Area'],
        is_furnished: false,
        year_built: 2020,
        latitude: 26.8100,
        longitude: 80.9800,
        is_featured: true,
        status: 'approved',
      },
      {
        title: 'PG Accommodation for Girls in Hazratganj',
        description: 'Safe and comfortable PG accommodation for working women and students. Includes meals and WiFi.',
        price: 8000,
        property_type: 'PG',
        transaction_type: 'PG',
        location: 'Hazratganj, Near Metro Station',
        area: 'Hazratganj',
        size: 150,
        bedrooms: 1,
        bathrooms: 1,
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
        owner_name: 'Sunita Devi',
        owner_phone: '9876543219',
        amenities: ['Meals', 'WiFi', 'Laundry', 'Security', 'AC'],
        is_furnished: true,
        year_built: 2021,
        latitude: 26.8500,
        longitude: 80.9480,
        is_featured: false,
        status: 'approved',
      },
    ];

    const results = [];
    for (const property of sampleProperties) {
      const propertyData = {
        ...property,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await dbClient
        .from('properties')
        .insert([propertyData])
        .select();

      if (error) {
        results.push({ title: property.title, success: false, error: error.message });
      } else {
        results.push({ title: property.title, success: true, id: data[0]?.id });
      }
    }

    const successCount = results.filter(r => r.success).length;
    res.json({
      success: true,
      message: `Seeded ${successCount} properties successfully.`,
      data: { total: sampleProperties.length, success: successCount, results },
    });
  } catch (error) {
    console.error('Seed properties error:', error);
    res.status(500).json({ success: false, error: 'Server error: ' + error.message });
  }
});

// ==================== IDENTITY VERIFICATION ROUTES ====================

/**
 * @route   GET /api/admin/verifications
 * @desc    Get all identity verification requests
 * @access  Private (Admin only)
 */
router.get('/verifications', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    
    const { data, error } = await dbClient
      .from('identity_verifications')
      .select(`
        *,
        users:user_id (
          email,
          name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      // Return empty array if table doesn't exist
      return res.json({ success: true, data: [] });
    }

    // Transform data to include user info
    const transformedData = (data || []).map(v => ({
      ...v,
      user_email: v.users?.email || '',
      user_name: v.users?.name || 'Unknown',
    }));

    res.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/verifications/:id
 * @desc    Approve or reject verification
 * @access  Private (Admin only)
 */
router.put('/verifications/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    const { status, rejection_reason } = req.body;

    const { data, error } = await dbClient
      .from('identity_verifications')
      .update({
        status,
        rejection_reason: rejection_reason || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.userId,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Update user verified status if approved
    if (status === 'approved') {
      await dbClient
        .from('users')
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq('id', data.user_id);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== ACCOUNT DELETION ROUTES ====================

/**
 * @route   GET /api/admin/account-deletion-requests
 * @desc    Get all account deletion requests
 * @access  Private (Admin only)
 */
router.get('/account-deletion-requests', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    
    const { data, error } = await dbClient
      .from('account_deletion_requests')
      .select(`
        *,
        users:user_id (
          email,
          name
        )
      `)
      .order('requested_at', { ascending: false });

    if (error) {
      return res.json({ success: true, data: [] });
    }

    const transformedData = (data || []).map(r => ({
      ...r,
      user_email: r.users?.email || r.user_email || '',
      user_name: r.users?.name || 'Unknown',
    }));

    res.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Get deletion requests error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/account-deletion-requests/:id
 * @desc    Approve or reject deletion request
 * @access  Private (Admin only)
 */
router.put('/account-deletion-requests/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    const { status } = req.body;

    // Get the request first
    const { data: request, error: fetchError } = await dbClient
      .from('account_deletion_requests')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    // Update request status
    const { data, error } = await dbClient
      .from('account_deletion_requests')
      .update({
        status,
        processed_at: new Date().toISOString(),
        processed_by: req.userId,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // If approved, delete user data
    if (status === 'approved') {
      // Delete user's properties
      await dbClient.from('properties').delete().eq('owner_id', request.user_id);
      // Delete user's bookings
      await dbClient.from('bookings').delete().eq('user_id', request.user_id);
      // Delete user's favorites
      await dbClient.from('favorites').delete().eq('user_id', request.user_id);
      // Delete user's chats
      await dbClient.from('chats').delete().or(`user1_id.eq.${request.user_id},user2_id.eq.${request.user_id}`);
      // Finally delete user profile
      await dbClient.from('users').delete().eq('id', request.user_id);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update deletion request error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==================== DATA DOWNLOAD ROUTES ====================

/**
 * @route   GET /api/admin/data-download-requests
 * @desc    Get all data download requests
 * @access  Private (Admin only)
 */
router.get('/data-download-requests', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();
    
    const { data, error } = await dbClient
      .from('data_download_requests')
      .select(`
        *,
        users:user_id (
          email,
          name
        )
      `)
      .order('requested_at', { ascending: false });

    if (error) {
      return res.json({ success: true, data: [] });
    }

    const transformedData = (data || []).map(r => ({
      ...r,
      user_email: r.users?.email || '',
      user_name: r.users?.name || 'Unknown',
    }));

    res.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Get download requests error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/data-download-requests/:id/process
 * @desc    Process data download request
 * @access  Private (Admin only)
 */
router.post('/data-download-requests/:id/process', authenticate, requireAdmin, async (req, res) => {
  try {
    const dbClient = getDbClient();

    // Get the request
    const { data: request, error: fetchError } = await dbClient
      .from('data_download_requests')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    // Gather user data
    const { data: userData } = await dbClient
      .from('users')
      .select('*')
      .eq('id', request.user_id)
      .single();

    const { data: properties } = await dbClient
      .from('properties')
      .select('*')
      .eq('owner_id', request.user_id);

    const { data: bookings } = await dbClient
      .from('bookings')
      .select('*')
      .eq('user_id', request.user_id);

    const { data: favorites } = await dbClient
      .from('favorites')
      .select('*')
      .eq('user_id', request.user_id);

    // Create download package (in real implementation, this would create a file)
    const downloadData = {
      user: userData,
      properties: properties || [],
      bookings: bookings || [],
      favorites: favorites || [],
      exported_at: new Date().toISOString(),
    };

    // Update request status
    const { data, error } = await dbClient
      .from('data_download_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        download_url: `/api/admin/data-download/${request.user_id}`,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data, downloadData });
  } catch (error) {
    console.error('Process download request error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

