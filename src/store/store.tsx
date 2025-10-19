import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from 'react-redux';
import AuthenticateSlice from "./slice/authentication/Authentication";
import JobSlice from "./slice/jobs/Jobs";
import CustomerSlice from "./slice/customer/Customer";
import EmployeeSlice from "./slice/employee/Employee";
import WorkRequestSlice from "./slice/work-request/WorkRequest";
import NotificationSlice from "./slice/notification/Notification";
import SettingsSlice from "./slice/settings/Settings";
import { injectStore } from "@/lib/utils/axios-instance";

export const store= configureStore({
    reducer: {
        authenticate: AuthenticateSlice,
        employee: EmployeeSlice,
        job: JobSlice,
        customer: CustomerSlice,
        workRequest: WorkRequestSlice,
        notification: NotificationSlice,
        settings: SettingsSlice
    }
});

injectStore(store);
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: (selector: (state: RootState) => any) => any = useSelector;