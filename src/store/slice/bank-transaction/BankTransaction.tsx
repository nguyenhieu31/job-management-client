import {
    createSlice,
    createAsyncThunk,
    type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export interface BankTransaction {
    employeeId: number;
    employeeEmail: string;
    sepayId: number;
    content: string;
}

interface InitialValuesStyle {
    loading: boolean;
    data: BankTransaction | null;
}


const initialState: InitialValuesStyle = {
    loading: false,
    data: null
};

const BankTransactionSlice = createSlice({
    name: "bankTransaction",
    initialState,
    reducers: {
        updateStateLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        updateData: (state, action: PayloadAction<BankTransaction>) => {
            state.data = action.payload;
        },
        resetData: (state) => {
            state.data = null;
            state.loading = false;
        }
    },
});

export const { updateStateLoading, updateData, resetData } = BankTransactionSlice.actions;
export default BankTransactionSlice.reducer;
