import { ApiResponse } from "@/components/types/ApiResponse";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { JobResponse } from "@/types/jobs";

export const getJobFromDropbox = async () =>{
    try {
        const res = await axiosInstance.get(`/admin/dropbox/get-new-leaf-folder-with-file-count`);
        return res as unknown as ApiResponse<JobResponse[]>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}