const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

describe("update", () => {
    it("updates first_name, last_name, personal_phone", async () => {
        mockChain.single.mockResolvedValue({
            data: { user_id: 1, first_name: "Jane" },
            error: null,
        });

        const result = await userRepository.update(1, {
            first_name: "Jane",
            last_name: "Doe",
            personal_phone: "999",
        });

        expect(mockChain.update).toHaveBeenCalledWith({
            first_name: "Jane",
            last_name: "Doe",
            personal_phone: "999",
        });
        expect(result.first_name).toBe("Jane");
    });

    it("throws on error", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { message: "update error" },
        });

        await expect(userRepository.update(1, {})).rejects.toThrow(
            "update error",
        );
    });
});
