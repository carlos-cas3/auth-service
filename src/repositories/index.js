/** Barrel module — re-exports all repository instances. */
const userRepository = require('./UserRepository');
const roleRepository = require('./RoleRepository');

module.exports = {
  userRepository,
  roleRepository,
};