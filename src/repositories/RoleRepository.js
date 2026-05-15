const { supabase, supabaseAdmin } = require("../config/supabase");

class RoleRepository {
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
