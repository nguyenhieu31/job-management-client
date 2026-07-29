"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { SendUpdatePasswordAction } from "@/store/slice/authentication/Authentication";

export default function ChangePasswordPage() {
  const dispatch = useAppDispatch();
  const { email, roleName } = useAppSelector((state) => state.authenticate);
  const isCustomer = roleName === 'CUSTOMER';
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength validation
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength === 0) return "";
    if (strength <= 2) return isCustomer ? "Weak" : "Yếu";
    if (strength <= 4) return isCustomer ? "Medium" : "Trung bình";
    return isCustomer ? "Strong" : "Mạnh";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword) {
      toast.error(isCustomer ? "Please enter your current password" : "Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    
    if (!newPassword) {
      toast.error(isCustomer ? "Please enter a new password" : "Vui lòng nhập mật khẩu mới");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error(isCustomer ? "New password must be at least 8 characters" : "Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error(isCustomer ? "Passwords do not match" : "Mật khẩu xác nhận không trùng khớp");
      return;
    }
    
    if (currentPassword === newPassword) {
      toast.error(isCustomer ? "New password must be different from current password" : "Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll use SendUpdatePasswordAction with the new password
      // You may need to adjust this based on your API requirements
      await dispatch(
        SendUpdatePasswordAction({
          email: email || "",
          oldPassword: currentPassword,
          newPassword: newPassword,
        }) as any
      );
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength(0);
    } catch (error: any) {
      toast.error(error.message || (isCustomer ? "Error changing password" : "Lỗi khi thay đổi mật khẩu"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-screen bg-background">
      <div className="w-full max-w-md">
        <Card className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{isCustomer ? "Change Password" : "Thay đổi mật khẩu"}</h1>
              <p className="text-sm text-muted-foreground">{isCustomer ? "Update your account password" : "Cập nhật mật khẩu tài khoản của bạn"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{isCustomer ? "Current Password" : "Mật khẩu hiện tại"}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder={isCustomer ? "Enter current password" : "Nhập mật khẩu hiện tại"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{isCustomer ? "New Password" : "Mật khẩu mới"}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder={isCustomer ? "Enter new password" : "Nhập mật khẩu mới"}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex gap-1 h-1">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors ${
                          i < passwordStrength
                            ? getPasswordStrengthColor(passwordStrength)
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isCustomer ? "Strength:" : "Độ mạnh:"} {getPasswordStrengthText(passwordStrength)}
                  </p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="bg-muted p-3 rounded-md space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  {newPassword.length >= 8 ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={newPassword.length >= 8 ? "text-foreground" : "text-muted-foreground"}>
                    {isCustomer ? "At least 8 characters" : "Ít nhất 8 ký tự"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "text-foreground" : "text-muted-foreground"}>
                    {isCustomer ? "Uppercase and lowercase" : "Chữ hoa và chữ thường"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/[0-9]/.test(newPassword) ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={/[0-9]/.test(newPassword) ? "text-foreground" : "text-muted-foreground"}>
                    {isCustomer ? "Contains numbers" : "Chứa số"}
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{isCustomer ? "Confirm New Password" : "Xác nhận mật khẩu mới"}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={isCustomer ? "Re-enter new password" : "Nhập lại mật khẩu mới"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {newPassword === confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">{isCustomer ? "Passwords match" : "Mật khẩu trùng khớp"}</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">{isCustomer ? "Passwords do not match" : "Mật khẩu không trùng khớp"}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10"
              disabled={
                isLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                newPassword.length < 8 ||
                passwordStrength < 3
              }
            >
              {isLoading ? (isCustomer ? "Updating..." : "Đang cập nhật...") : (isCustomer ? "Change Password" : "Thay đổi mật khẩu")}
            </Button>
          </form>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md text-xs text-blue-900 dark:text-blue-100 space-y-1">
            <p className="font-semibold">{isCustomer ? "💡 Security Tips:" : "💡 Gợi ý bảo mật:"}</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>{isCustomer ? "Use a strong password with uppercase, lowercase, numbers and special characters" : "Sử dụng mật khẩu mạnh với chữ hoa, chữ thường, số và ký tự đặc biệt"}</li>
              <li>{isCustomer ? "Do not share your password with anyone" : "Không chia sẻ mật khẩu của bạn với bất kỳ ai"}</li>
              <li>{isCustomer ? "Change your password regularly to protect your account" : "Thay đổi mật khẩu định kỳ để bảo vệ tài khoản"}</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
