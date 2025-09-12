const User = require('../models/User');

/**
 * Update user's website status when crawling job completes
 * @param {string} jobId - The job ID
 * @param {string} status - New status (completed, failed, etc.)
 * @param {object} additionalData - Additional data to update
 */
const updateWebsiteStatus = async (jobId, status, additionalData = {}) => {
  try {
    const user = await User.findOne({
      'crawledWebsites.jobId': jobId
    });

    if (!user) {
      console.log(`No user found for jobId: ${jobId}`);
      return { success: false, error: 'User not found' };
    }

    const website = user.crawledWebsites.find(w => w.jobId === jobId);
    if (!website) {
      console.log(`No website found for jobId: ${jobId}`);
      return { success: false, error: 'Website not found' };
    }

    // Update website status and additional data
    website.status = status;
    Object.assign(website, additionalData);

    await user.save();

    console.log(`Updated website ${website.url} status to ${status} for user ${user._id}`);
    return { success: true, user, website };

  } catch (error) {
    console.error('Error updating website status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Find user by website URL
 * @param {string} websiteUrl - The website URL
 * @returns {Promise<object>} User object or null
 */
const findUserByWebsite = async (websiteUrl) => {
  try {
    const user = await User.findOne({
      'crawledWebsites.url': websiteUrl
    });
    return user;
  } catch (error) {
    console.error('Error finding user by website:', error);
    return null;
  }
};

module.exports = {
  updateWebsiteStatus,
  findUserByWebsite
};
