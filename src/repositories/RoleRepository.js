const { supabase, supabaseAdmin } = require("../config/supabase");

class RoleRepository {
    /**
     * Find a role by its name (e.g. "SUPER_ADMIN", "VENDOR_ADMIN").
     *
     * @param {string} roleName - The role name to look up
     * @returns {Promise<Object|null>} Role row ({ role_id, role_name, role_description }) or null if not found
     * @throws {Error} On unexpected database errors (code !== PGRST116)
     */
    async findByName(roleName) {
        const client = supabaseAdmin || supabase;
        console.log('Usando admin client:', client === supabaseAdmin);
        const { data, error } = await client
            .from("roles")
            .select("*")
            .eq("role_name", roleName)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Find a role by its numeric ID.
     *
     * @param {number} roleId - The role ID to look up
     * @returns {Promise<Object|null>} Role row or null if not found
     * @throws {Error} On unexpected database errors
     */
    async findById(roleId) {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client
            .from("roles")
            .select("*")
            .eq("role_id", roleId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Retrieve all available roles.
     *
     * @returns {Promise<Object[]>} Array of role rows
     * @throws {Error} On database query failure
     */
    async findAll() {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client.from("roles").select("*");

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

module.exports = new RoleRepository();
