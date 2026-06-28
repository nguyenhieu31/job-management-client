import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  GoogleAuthCallbackService,
  RegisterAccountService,
  ActiveAccountService,
  LoginService,
  CheckSessionLoginService,
  LogoutService,
  FindEmailExistAPI,
  SendUpdatePasswordAPI,
} from "@/services/AuthenticateApi";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/types/authentication";
import { toast } from "react-toastify";

interface InitialValuesStyle {
  isLoginned: boolean;
  emailExist: boolean;
  updatePassword: boolean;
  loading: boolean;
  message: string;
  error: string;
  errorRegister: boolean | null;
  otp: string;
  otpExpires: null;
  fullName: string;
  roleName: string;
  email: string;
  phoneNumber: string;
  featureAccountId: number[];
}

export const RegisterAccountAction = createAsyncThunk<string, RegisterRequest>(
  "RegisterAccountAction",
  async (data: RegisterRequest) => {
    try {
      const response = await RegisterAccountService(data);
      toast.success("Register account successfully");
      return response.data as string;
    } catch (err: any) {
      toast.error(
        err.message
          ? err.message
          : "Have error when try register account. Please contact hotline xxx for consulting support."
      );
      throw new Error(err.message);
    }
  }
);

export const ActiveAccountAction = createAsyncThunk<string, any>(
  "ActiveAccountAction",
  async (values: string) => {
    try {
      const response = await ActiveAccountService(values);
      toast.success("Active account successfully");
      return response.data as string;
    } catch (err: any) {
      toast.error(err.message);
      throw new Error(err.message);
    }
  }
);

export const LoginAccountAction = createAsyncThunk<LoginResponse, LoginRequest>(
  "LoginAccountAction",
  async (data: LoginRequest) => {
    try {
      const response = await LoginService(data);
      return response.data as LoginResponse;
    } catch (err: any) {
      toast.error("Tài khoản hoặc mật khẩu không đúng");
      throw new Error(err.message);
    }
  }
);

export const CheckSessionLoginAction = createAsyncThunk<LoginResponse>(
  "CheckSessionLoginAction",
  async () => {
    try {
      const response = await CheckSessionLoginService();
      return response.data as LoginResponse;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const LogoutAction = createAsyncThunk<string, void>(
  "LogoutAction",
  async () => {
    try {
      const response = await LogoutService();
      toast.success(response.data || "Logout successfully");
      return response.data as string;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const FindEmailExistAction = createAsyncThunk<string, string>(
  "FindEmailExistAction",
  async (email: string) => {
    try {
      const response = await FindEmailExistAPI(email);
      return response as unknown as string;
    } catch (err: any) {
      toast.error("Email does not exist");
      throw new Error(err.message);
    }
  }
);

export const SendUpdatePasswordAction = createAsyncThunk<
  string,
  { email: string; oldPassword: string; newPassword: string }
>(
  "SendUpdatePasswordAction",
  async (data: { email: string; oldPassword: string; newPassword: string }) => {
    try {
      const response = await SendUpdatePasswordAPI(data);
      toast.success("Cập nhật mật khẩu thành công");
      return response.data as string;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const GoogleAuthAction = createAsyncThunk<LoginResponse, { code: string; state: string }>(
  "GoogleAuthAction",
  async ({ code, state }) => {
    try {
      const response = await GoogleAuthCallbackService(code, state);
      return response.data as LoginResponse;
    } catch (err: any) {
      toast.error("Google authentication failed. Please try again.");
      throw new Error(err.message);
    }
  }
);

const initialState: InitialValuesStyle = {
  loading: false,
  errorRegister: null,
  error: "",
  message: "",
  otp: "",
  otpExpires: null,
  fullName: "",
  roleName: "",
  featureAccountId: [],
  isLoginned: false,
  email: "",
  phoneNumber: "",
  emailExist: false,
  updatePassword: false,
};

const AuthenticateSlice = createSlice({
  name: "authenticate",
  initialState,
  reducers: {
    updateOtp: (state, action) => {
      state.otp = action.payload.otp;
      state.otpExpires = action.payload.otpExpires;
    },
    updateStateLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(RegisterAccountAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(ActiveAccountAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(LoginAccountAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(CheckSessionLoginAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(FindEmailExistAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(SendUpdatePasswordAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(GoogleAuthAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(RegisterAccountAction.fulfilled, (state, action) => {
        state.loading = false;
        state.errorRegister = false;
        state.message = action.payload || "Register account successfully";
      })
      .addCase(ActiveAccountAction.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload || "Register account successfully";
      })
      .addCase(
        LoginAccountAction.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.fullName = action.payload.fullName;
          state.roleName = action.payload.roleName;
          state.email = action.payload.email;
          state.phoneNumber = action.payload.phoneNumber;
          state.isLoginned = true;
        }
      )
      .addCase(
        CheckSessionLoginAction.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.fullName = action.payload.fullName;
          state.roleName = action.payload.roleName;
          state.email = action.payload.email;
          state.phoneNumber = action.payload.phoneNumber;
          state.isLoginned = true;
        }
      )
      .addCase(LogoutAction.fulfilled, (state) => {
        state.loading = false;
        state.fullName = "";
        state.roleName = "";
        state.featureAccountId = [];
        state.isLoginned = false;
      })
      .addCase(FindEmailExistAction.fulfilled, (state) => {
        state.loading = false;
        state.emailExist = true;
      })
      .addCase(SendUpdatePasswordAction.fulfilled, (state) => {
        state.loading = false;
        state.updatePassword = true;
      })
      .addCase(
        GoogleAuthAction.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.fullName = action.payload.fullName;
          state.roleName = action.payload.roleName;
          state.email = action.payload.email;
          state.phoneNumber = action.payload.phoneNumber;
          state.isLoginned = true;
        }
      )
      .addCase(RegisterAccountAction.rejected, (state, action) => {
        state.loading = false;
        state.errorRegister = true;
        state.error = action.error.message || "Register account failed";
      })
      .addCase(ActiveAccountAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Register account failed";
      })
      .addCase(LoginAccountAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login account failed";
        state.isLoginned = false;
      })
      .addCase(CheckSessionLoginAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Check session login failed";
        state.isLoginned = false;
      })
      .addCase(LogoutAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Logout failed";
      })
      .addCase(FindEmailExistAction.rejected, (state, action) => {
        state.loading = false;
        state.emailExist = false;
        state.error = action.error.message || "Account not exist";
      })
      .addCase(SendUpdatePasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.updatePassword = false;
        toast.error("Mật khẩu cũ không đúng");
        state.error = action.error.message || "Update password is failed";
      })
      .addCase(GoogleAuthAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Google authentication failed";
        state.isLoginned = false;
      });
  },
});

export const { updateOtp, updateStateLoading } = AuthenticateSlice.actions;
export default AuthenticateSlice.reducer;
