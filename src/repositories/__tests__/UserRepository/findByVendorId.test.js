const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

describe("findByVendorId", () => {
    it("returns user by vendor_id", async () => {
        mockChain.single.mockResolvedValue({
            data: { user_id: 1, vendor_id: 42 },
            error: null,
        });

        const result = await userRepository.findByVendorId(42);

        expect(mockChain.eq).toHaveBeenCalledWith("vendor_id", 42);
        expect(result.vendor_id).toBe(42);
    });

    it("returns null on PGRST116", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
        });

        expect(await userRepository.findByVendorId(999)).toBeNull();
    });

    it("throws on DB error", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { message: "vendor error" },
        });

        await expect(userRepository.findByVendorId(1)).rejects.toThrow(
            "vendor error",
        );
    });
});
