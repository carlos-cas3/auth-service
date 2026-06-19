const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

describe("updateVendorId", () => {
    it("returns updated user with new vendor_id", async () => {
        mockChain.single.mockResolvedValue({
            data: { user_id: 1, vendor_id: 99 },
            error: null,
        });

        const result = await userRepository.updateVendorId(1, 99);

        expect(mockChain.update).toHaveBeenCalledWith({ vendor_id: 99 });
        expect(result.vendor_id).toBe(99);
    });

    it("throws on error", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { message: "vendor update failed" },
        });

        await expect(userRepository.updateVendorId(1, 99)).rejects.toThrow(
            "vendor update failed",
        );
    });
});
