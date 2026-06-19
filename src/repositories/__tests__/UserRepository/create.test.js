const { setupMocks } = require("./helpers/mockSetup");

const { mockChain } = setupMocks();
const userRepository = require("../../UserRepository");

const baseUserData = {
    first_name: "John",
    last_name: "Doe",
    email: "john@test.com",
    personal_phone: "123456",
    password: "hashed_pw",
    role_id: 2,
    status: "PENDING",
};

describe("create", () => {
    it("creates and returns user", async () => {
        mockChain.single.mockResolvedValue({
            data: { user_id: 1 },
            error: null,
        });

        const result = await userRepository.create(baseUserData);

        expect(mockChain.insert).toHaveBeenCalled();
        expect(result.user_id).toBe(1);
    });

    it("sets vendor_id as null when not provided", async () => {
        mockChain.single.mockResolvedValue({
            data: { user_id: 2 },
            error: null,
        });

        await userRepository.create(baseUserData);

        const insertCall = mockChain.insert.mock.calls[0][0];
        expect(insertCall.vendor_id).toBeNull();
    });

    it("includes vendor_id when provided", async () => {
        mockChain.single.mockResolvedValue({
            data: { user_id: 3 },
            error: null,
        });

        await userRepository.create({ ...baseUserData, vendor_id: 7 });

        const insertCall = mockChain.insert.mock.calls[0][0];
        expect(insertCall.vendor_id).toBe(7);
    });

    it("throws on duplicate email", async () => {
        mockChain.single.mockResolvedValue({
            data: null,
            error: { message: "Duplicate email" },
        });

        await expect(userRepository.create(baseUserData)).rejects.toThrow(
            "Duplicate email",
        );
    });
});
