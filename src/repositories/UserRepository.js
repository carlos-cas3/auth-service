const { supabase, supabaseAdmin } = require("../config/supabase");

class UserRepository {
    async findByEmail(email) {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .select("*, roles(role_name, role_description)") // añadir join
            .eq("email", email)
            .single();

        if (error && error.code !== "PGRST116") throw new Error(error.message);
        return data;
    }

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

    async create(userData) {
        const {
            first_name,
            last_name,
            email,
            phone,
            password,
            role_id,
            status,
        } = userData;

        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .insert({
                first_name,
                last_name,
                email,
                phone,
                password,
                role_id,
                status,
                vendor_id: userData.vendor_id || null,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

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

    async updateVendorId(userId, vendorId) {
        const { data, error } = await (supabaseAdmin || supabase)
            .from("users")
            .update({ vendor_id: vendorId })
            .eq("user_id", userId)
            .select("*, roles(role_name, role_description)") // añadir join
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

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

    async delete(userId) {
        const { error } = await (supabaseAdmin || supabase)
            .from("users")
            .delete()
            .eq("user_id", userId);
        if (error) throw new Error(error.message);
    }
}

module.exports = new UserRepository();
