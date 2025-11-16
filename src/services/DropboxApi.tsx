import { ApiResponse } from "@/components/types/ApiResponse";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { JobResponse } from "@/types/jobs";
import { VideoResponse } from "@/types/videos";

export const getJobFromDropbox = async () =>{
    try {
        const res = await axiosInstance.get(`/admin/dropbox/get-new-leaf-folder-with-file-count`);
        return res as unknown as ApiResponse<JobResponse[]>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getVideoFromDropbox = async () =>{
    try {
        const res = await axiosInstance.get(`/admin/dropbox/get-new-leaf-folder-with-file-count-for-video`);
        return res as unknown as ApiResponse<VideoResponse[]>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}