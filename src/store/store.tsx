import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from 'react-redux';
import AuthenticateSlice from "./slice/authentication/Authentication";
import JobSlice from "./slice/jobs/Jobs";
import CustomerSlice from "./slice/customer/Customer";
import EmployeeSlice from "./slice/employee/Employee";
import WorkRequestSlice from "./slice/work-request/WorkRequest";
import NotificationSlice from "./slice/notification/Notification";
import SettingsSlice from "./slice/settings/Settings";
import InvoicesSlice from "./slice/invoices/Invoices";
import PayrollSlice from "./slice/payroll/Payroll";
import PayrollPeriodSlice from "./slice/payroll-period/PayrollPeriod";
import VideoSlice from "./slice/videos/Videos";
import BankTransactionSlice from "./slice/bank-transaction/BankTransaction";
import { injectStore } from "@/lib/utils/axios-instance";

export const store = configureStore({
    reducer: {
        authenticate: AuthenticateSlice,
        employee: EmployeeSlice,
        job: JobSlice,
        video: VideoSlice,
        customer: CustomerSlice,
        workRequest: WorkRequestSlice,
        notification: NotificationSlice,
        settings: SettingsSlice,
        invoices: InvoicesSlice,
        payroll: PayrollSlice,
        payrollPeriod: PayrollPeriodSlice,
        bankTransaction: BankTransactionSlice,
    }
});

injectStore(store);
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: (selector: (state: RootState) => any) => any = useSelector;