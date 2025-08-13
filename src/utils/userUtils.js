const os = require('os');

/**
 * Get the current system username
 * @returns {string} The current username
 */
function getUserName() {
  return os.userInfo().username;
}

/**
 * Get the user's home directory
 * @returns {string} The path to the user's home directory
 */
function getHomeDir() {
  return os.homedir();
}

module.exports = {
  getUserName,
  getHomeDir
};
