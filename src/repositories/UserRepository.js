const { supabase, supabaseAdmin } = require("../config/supabase");

class UserRepository {
    /**
     * Find a user by email address, including their role data.
     *
     * @param {string} email - Email to search for
     * @returns {Promise<Object|null>} User row with joined roles, or null if not found
     * @throws {Error} On unexpected database errors (code !== PGRST116)
     */
    async findByEmail(email) {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .select("*, roles(role_name, role_description)")
            .eq("email", email)
            .single();

        if (error && error.code !== "PGRST116") throw new Error(error.message);
        return data;
    }

    /**
     * Find a user by their numeric user ID.
     *
     * @param {number} userId - User ID to look up
     * @returns {Promise<Object|null>} User row with joined roles, or null if not found
     * @throws {Error} On unexpected database errors
     */
    async findById(userId) {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .select("*, roles(role_name, role_description)")
            .eq("user_id", userId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Find a user by their linked vendor ID.
     *
     * @param {number} vendorId - Vendor ID to look up
     * @returns {Promise<Object|null>} User row with joined roles, or null if not found
     * @throws {Error} On unexpected database errors
     */
    async findByVendorId(vendorId) {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .select("*, roles(role_name, role_description)")
            .eq("vendor_id", vendorId)
            .single();

        if (error && error.code !== "PGRST116") throw new Error(error.message);
        return data;
    }

    /**
     * Create a new user row.
     *
     * @param {Object} userData - User data (snake_case keys)
     * @param {string} userData.first_name - First name
     * @param {string} userData.last_name - Last name
     * @param {string} userData.email - Email address
     * @param {string} userData.personal_phone - Phone number
     * @param {string} userData.password - Hashed password
     * @param {number} userData.role_id - Role ID
     * @param {string} userData.status - Initial status
     * @param {number|null} [userData.vendor_id] - Optional vendor ID
     * @returns {Promise<Object>} The created user row
     * @throws {Error} On database insert failure
     */
    async create(userData) {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .insert({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                personal_phone: userData.personal_phone,
                password: userData.password,
                role_id: userData.role_id,
                status: userData.status,
                vendor_id: userData.vendor_id || null,
                must_change_password: userData.must_change_password || false,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Update a user's status.
     *
     * @param {number} userId - ID of the user to update
     * @param {string} status - New status (PENDING, ACTIVE, INACTIVE, SUSPENDED)
     * @returns {Promise<Object>} Updated user row with joined roles
     * @throws {Error} On database update failure
     */
    async updateStatus(userId, status) {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .update({ status })
            .eq("user_id", userId)
            .select("*, roles(role_name, role_description)")
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Link a vendor ID to an existing user.
     *
     * @param {number} userId - ID of the user
     * @param {number} vendorId - Vendor ID returned by the Vendor Service
     * @returns {Promise<Object>} Updated user row with joined roles
     * @throws {Error} On database update failure
     */
    async updateVendorId(userId, vendorId) {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .update({ vendor_id: vendorId })
            .eq("user_id", userId)
            .select("*, roles(role_name, role_description)")
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Update a user's basic profile fields (first_name, last_name, personal_phone).
     *
     * @param {number} userId - ID of the user to update
     * @param {Object} data - Fields to update (snake_case)
     * @param {string} [data.first_name] - New first name
     * @param {string} [data.last_name] - New last name
     * @param {string} [data.personal_phone] - New phone number
     * @returns {Promise<Object>} Updated user row with joined roles
     * @throws {Error} On database update failure
     */
    async update(userId, data) {
        const { data: user, error } = await (supabaseAdmin || supabase)
            .from("users")
            .update({
                first_name: data.first_name,
                last_name: data.last_name,
                personal_phone: data.personal_phone,
            })
            .eq("user_id", userId)
            .select("*, roles(role_name, role_description)")
            .single();

        if (error) throw new Error(error.message);
        return user;
    }

    /**
     * Find all VENDOR_ADMIN users with PENDING status, ordered by creation date descending.
     *
     * @returns {Promise<Object[]>} Array of pending user rows with joined roles
     * @throws {Error} On database query failure
     */
    async findAllPending() {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .select("*, roles(role_name, role_description)")
            .eq("status", "PENDING")
            .eq("role_id", 2)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Retrieve all users with role data, ordered by creation date descending.
     *
     * @returns {Promise<Object[]>} Array of user rows
     * @throws {Error} On database query failure
     */
    async findAll() {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .select("*, roles(role_name, role_description)")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Delete a user by ID.
     *
     * @param {number} userId - ID of the user to delete
     * @returns {Promise<void>}
     * @throws {Error} On database delete failure
     */
    async delete(userId) {
        const { error } = await (supabaseAdmin || supabase)
            .from("users")
            .delete()
            .eq("user_id", userId);
        if (error) throw new Error(error.message);
    }
}

module.exports = new UserRepository();
