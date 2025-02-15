
export const handleAxiosError = (error: unknown) => {
    if ((error as any).response)
        throw ((error as any).response.data);
    throw error;
}