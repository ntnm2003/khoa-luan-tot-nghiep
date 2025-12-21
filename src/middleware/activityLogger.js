const Activity = require('../schemas/Activity');

const logActivity = async (userId, materialId, courseId, action, campus) => {
  try {
    await Activity.create({
      user: userId,
      material: materialId,
      course: courseId,
      action: action,
      actionDetails: {
        campus: campus || 'unknown',
        timestamp: new Date()
      },
      status: 'success'
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };

