// Admin Panel System
// Backend logic for managing user verifications

require('dotenv').config();

const { verificationSystem } = require('./verify');

class AdminPanel {
  constructor() {
    this.adminToken = process.env.ADMIN_TOKEN;
    if (!this.adminToken) {
      throw new Error('ADMIN_TOKEN not configured in .env file');
    }
  }

  // Admin authentication middleware
  authenticateAdmin(req, res, next) {
    const adminToken = req.headers.admin;
    
    if (!adminToken || adminToken !== this.adminToken) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
    
    next();
  }

  // Get all users with verification status
  getUsers() {
    try {
      const verifications = verificationSystem.getAllVerifications();
      
      return verifications.map(verification => ({
        userId: verification.userId,
        brokerId: verification.brokerId,
        status: verification.status,
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
        reviewedAt: verification.reviewedAt,
        notes: verification.notes,
        id: verification.id
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Approve user verification
  approveUser(userId) {
    try {
      const verification = verificationSystem.getVerificationByUserId(userId);
      
      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.status === 'approved') {
        return {
          success: false,
          message: 'User already approved'
        };
      }

      verificationSystem.updateVerificationStatus(
        verification.id,
        'approved',
        'admin',
        'Approved by admin'
      );

      return {
        success: true,
        message: 'User approved successfully',
        userId: userId,
        status: 'approved'
      };
    } catch (error) {
      console.error('Error approving user:', error);
      throw new Error('Failed to approve user');
    }
  }

  // Reject user verification
  rejectUser(userId, reason = 'Rejected by admin') {
    try {
      const verification = verificationSystem.getVerificationByUserId(userId);
      
      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.status === 'rejected') {
        return {
          success: false,
          message: 'User already rejected'
        };
      }

      verificationSystem.updateVerificationStatus(
        verification.id,
        'rejected',
        'admin',
        reason
      );

      return {
        success: true,
        message: 'User rejected successfully',
        userId: userId,
        status: 'rejected'
      };
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw new Error('Failed to reject user');
    }
  }

  // Get user statistics
  getStatistics() {
    try {
      const stats = verificationSystem.getStatistics();
      
      return {
        ...stats,
        pendingUsers: stats.pending,
        approvedUsers: stats.approved,
        rejectedUsers: stats.rejected,
        totalUsers: stats.total
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  // Get pending users only
  getPendingUsers() {
    try {
      const verifications = verificationSystem.getPendingVerifications();
      
      return verifications.map(verification => ({
        userId: verification.userId,
        brokerId: verification.brokerId,
        status: verification.status,
        createdAt: verification.createdAt,
        id: verification.id
      }));
    } catch (error) {
      console.error('Error getting pending users:', error);
      throw new Error('Failed to fetch pending users');
    }
  }

  // Search users by broker ID
  searchUsersByBrokerId(brokerId) {
    try {
      const verifications = verificationSystem.getAllVerifications();
      
      return verifications
        .filter(v => v.brokerId.toLowerCase().includes(brokerId.toLowerCase()))
        .map(verification => ({
          userId: verification.userId,
          brokerId: verification.brokerId,
          status: verification.status,
          createdAt: verification.createdAt,
          updatedAt: verification.updatedAt,
          id: verification.id
        }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  // Get user details
  getUserDetails(userId) {
    try {
      const verification = verificationSystem.getVerificationByUserId(userId);
      
      if (!verification) {
        throw new Error('User not found');
      }

      return {
        userId: verification.userId,
        brokerId: verification.brokerId,
        status: verification.status,
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
        reviewedAt: verification.reviewedAt,
        notes: verification.notes,
        id: verification.id
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      throw new Error('Failed to fetch user details');
    }
  }

  // Bulk approve users
  bulkApprove(userIds) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = this.approveUser(userId);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            userId: userId,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error bulk approving users:', error);
      throw new Error('Failed to bulk approve users');
    }
  }

  // Bulk reject users
  bulkReject(userIds, reason = 'Bulk rejected by admin') {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = this.rejectUser(userId, reason);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            userId: userId,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error bulk rejecting users:', error);
      throw new Error('Failed to bulk reject users');
    }
  }
}

// Export singleton instance
const adminPanel = new AdminPanel();

module.exports = {
  adminPanel,
  AdminPanel
};
