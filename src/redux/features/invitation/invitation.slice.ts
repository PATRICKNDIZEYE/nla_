export const cancelInvitation = createAsyncThunk(
  'invitation/cancel',
  async (invitationId: string) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<Invitations>>(`/invitations/${invitationId}/cancel`);
      return data;
    } catch (error) {
      const err = error as ResponseError;
      throw new Error(err.response?.data.message || 'Failed to cancel invitation');
    }
  }
);

const invitationSlice = createSlice({
  name: 'invitation',
  initialState,
  reducers: {
    // ... other reducers
  },
  extraReducers: (builder) => {
    // ... other cases

    builder.addCase(cancelInvitation.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(cancelInvitation.fulfilled, (state, action) => {
      state.loading = false;
      // Update the invitation isCanceled status in the state
      const index = state.data.data.findIndex(inv => inv._id === action.payload.data._id);
      if (index !== -1) {
        state.data.data[index] = {
          ...state.data.data[index],
          isCanceled: true
        };
      }
    });

    builder.addCase(cancelInvitation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
    });
  }
}); 