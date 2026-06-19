const mockChain = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
};

jest.mock("../../../../config/supabase", () => ({
    supabase: { from: jest.fn() },
    supabaseAdmin: { from: jest.fn() },
}));

function setupMocks() {
    const { supabase, supabaseAdmin } = require("../../../../config/supabase");

    beforeEach(() => {
        jest.clearAllMocks();

        // Fluent API: métodos intermedios devuelven mockChain
        mockChain.select.mockReturnValue(mockChain);
        mockChain.insert.mockReturnValue(mockChain);
        mockChain.update.mockReturnValue(mockChain);
        mockChain.delete.mockReturnValue(mockChain);
        mockChain.eq.mockReturnValue(mockChain);
        mockChain.order.mockReturnValue(mockChain);

        // from() apunta a mockChain
        supabaseAdmin.from.mockReturnValue(mockChain);
        supabase.from.mockReturnValue(mockChain);
    });

    return { mockChain, supabase, supabaseAdmin };
}

module.exports = { setupMocks };
