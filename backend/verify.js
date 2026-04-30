// User Verification System
// Handles broker ID verification for access control

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class VerificationSystem {
  constructor() {
    this.storagePath = path.join(__dirname, '..', 'data', 'verifications.json');
    this.verificationData = new Map();
    this.loadData();
  }

  // Load existing data from file
  loadData() {
    try {
      const dataDir = path.dirname(this.storagePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf8');
        const parsed = JSON.parse(data);
        this.verificationData = new Map(Object.entries(parsed));
        console.log('Verification data loaded:', this.verificationData.size, 'records');
      }
    } catch (error) {
      console.error('Error loading verification data:', error);
      this.verificationData = new Map();
    }
  }

  // Save data to file
  saveData() {
    try {
      const data = Object.fromEntries(this.verificationData);
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
      console.log('Verification data saved');
    } catch (error) {
      console.error('Error saving verification data:', error);
    }
  }

  // Create new verification request
  createVerification(userId, brokerId) {
    const verificationId = uuidv4();
    const verification = {
      id: verificationId,
      userId: userId,
      brokerId: brokerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      notes: null
    };

    this.verificationData.set(verificationId, verification);
    this.saveData();

    return verification;
  }

  // Get verification by ID
  getVerification(verificationId) {
    return this.verificationData.get(verificationId);
  }

  // Get verification by user ID
  getVerificationByUserId(userId) {
    for (const [id, verification] of this.verificationData) {
      if (verification.userId === userId) {
        return verification;
      }
    }
    return null;
  }

  // Update verification status
  updateVerificationStatus(verificationId, status, reviewedBy = null, notes = null) {
    const verification = this.verificationData.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    verification.status = status;
    verification.updatedAt = new Date().toISOString();
    verification.reviewedAt = new Date().toISOString();
    verification.reviewedBy = reviewedBy;
    verification.notes = notes;

    this.verificationData.set(verificationId, verification);
    this.saveData();

    return verification;
  }

  // Check if user has approved verification
  isUserApproved(userId) {
    const verification = this.getVerificationByUserId(userId);
    return verification && verification.status === 'approved';
  }

  // Get all verifications (for admin)
  getAllVerifications() {
    return Array.from(this.verificationData.values());
  }

  // Get pending verifications (for admin)
  getPendingVerifications() {
    return this.getAllVerifications().filter(v => v.status === 'pending');
  }

  // Get verification statistics
  getStatistics() {
    const all = this.getAllVerifications();
    return {
      total: all.length,
      pending: all.filter(v => v.status === 'pending').length,
      approved: all.filter(v => v.status === 'approved').length,
      rejected: all.filter(v => v.status === 'rejected').length
    };
  }

  // Delete old verification records (cleanup)
  cleanupOldRecords(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    for (const [id, verification] of this.verificationData) {
      const verificationDate = new Date(verification.createdAt);
      if (verificationDate < cutoffDate && verification.status !== 'pending') {
        this.verificationData.delete(id);
      }
    }

    this.saveData();
    console.log('Old verification records cleaned up');
  }

  // Validate broker ID format
  validateBrokerId(brokerId) {
    if (!brokerId || typeof brokerId !== 'string') {
      return false;
    }

    // Remove whitespace and convert to uppercase
    const cleanId = brokerId.trim().toUpperCase();

    // Basic validation - adjust according to your broker's ID format
    // Common formats: alphanumeric, numeric, or specific patterns
    const patterns = [
      /^[A-Z0-9]{6,20}$/, // 6-20 alphanumeric characters
      /^\d{8,12}$/, // 8-12 digits
      /^[A-Z]{2}\d{6,10}$/ // 2 letters + 6-10 digits
    ];

    return patterns.some(pattern => pattern.test(cleanId));
  }

  // Format broker ID for storage
  formatBrokerId(brokerId) {
    if (!brokerId) return null;
    return brokerId.trim().toUpperCase();
  }

  // Get user verification status
  getUserVerificationStatus(userId) {
    const verification = this.getVerificationByUserId(userId);
    if (!verification) {
      return {
        status: 'not_found',
        message: 'No verification request found'
      };
    }

    const statusMessages = {
      'pending': 'Verification is being reviewed',
      'approved': 'Access granted',
      'rejected': 'Verification rejected'
    };

    return {
      status: verification.status,
      message: statusMessages[verification.status] || 'Unknown status',
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt,
      notes: verification.notes
    };
  }
}

// Export singleton instance
const verificationSystem = new VerificationSystem();

module.exports = {
  verificationSystem
};
