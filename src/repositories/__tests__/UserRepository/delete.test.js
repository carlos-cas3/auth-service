const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

describe("delete", () => {
    it("resolves without value on success", async () => {
        // delete termina en .eq(), no en .single()
        mockChain.eq.mockResolvedValue({ error: null });

        await expect(userRepository.delete(1)).resolves.toBeUndefined();
        expect(mockChain.eq).toHaveBeenCalledWith("user_id", 1);
    });

    it("throws on delete failure", async () => {
        mockChain.eq.mockResolvedValue({ error: { message: "delete failed" } });

        await expect(userRepository.delete(1)).rejects.toThrow("delete failed");
    });
});
