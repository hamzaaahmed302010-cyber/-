import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Upload,
  Download,
  X,
  Lock,
  RefreshCw,
  LogOut,
  Calendar,
} from 'lucide-react';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/firebase';
import {
  saveBackupToDrive,
  listDriveBackups,
  restoreBackupFromDrive,
  type DriveFileInfo,
} from '../services/driveService';
import { formatArabicDateTime, exportDataAsJsonFile } from '../services/storage';
import type { AppData } from '../types';

interface DriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onRestoreData: (restoredData: AppData) => void;
  onBackupSuccess: (backupTime: string) => void;
}

export const DriveBackupModal: React.FC<DriveBackupModalProps> = ({
  isOpen,
  onClose,
  appData,
  onRestoreData,
  onBackupSuccess,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backups, setBackups] = useState<DriveFileInfo[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmRestoreFile, setConfirmRestoreFile] = useState<DriveFileInfo | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        const tok = token || (await getAccessToken());
        setAccessToken(tok);
        if (tok) {
          fetchBackupsList(tok);
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setBackups([]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const fetchBackupsList = async (token: string) => {
    try {
      const files = await listDriveBackups(token);
      setBackups(files);
    } catch (err: any) {
      console.error('Failed to load drive backups:', err);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMessage({ text: `أهلاً بكِ ${res.user.displayName || ''}! تم الربط بحساب Google بنجاح.`, type: 'success' });
        await fetchBackupsList(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setStatusMessage({ text: err.message || 'تعذر تسجيل الدخول بحساب Google.', type: 'error' });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setBackups([]);
      setStatusMessage({ text: 'تم تسجيل الخروج بنجاح.', type: 'info' });
    } catch (err: any) {
      setStatusMessage({ text: 'حدث خطأ أثناء تسجيل الخروج.', type: 'error' });
    }
  };

  const handleBackupNow = async () => {
    if (!accessToken) {
      setStatusMessage({ text: 'يرجى تسجيل الدخول بحساب Google أولاً.', type: 'error' });
      return;
    }

    setIsBackingUp(true);
    setStatusMessage(null);
    try {
      const result = await saveBackupToDrive(appData, accessToken);
      onBackupSuccess(result.modifiedTime);
      setStatusMessage({ text: 'تم حفظ النسخة الاحتياطية بنجاح على Google Drive! 🌸', type: 'success' });
      await fetchBackupsList(accessToken);
    } catch (err: any) {
      console.error('Backup error:', err);
      setStatusMessage({ text: err.message || 'فشل حفظ النسخة على Google Drive.', type: 'error' });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Required by workspace skill: Explicit confirmation modal for mutating operations
  const handleConfirmRestore = async () => {
    if (!confirmRestoreFile || !accessToken) return;

    setIsRestoring(true);
    setStatusMessage(null);
    try {
      const restored = await restoreBackupFromDrive(confirmRestoreFile.id, accessToken);
      onRestoreData(restored);
      setStatusMessage({
        text: 'تمت استعادة كافة البيانات من Google Drive بنجاح! تم تحديث الخزين والميزانية وسجلاتك.',
        type: 'success',
      });
      setConfirmRestoreFile(null);
    } catch (err: any) {
      console.error('Restore error:', err);
      setStatusMessage({ text: err.message || 'فشلت استعادة البيانات من الملف المحدد.', type: 'error' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleLocalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.pantry && json.budget) {
          onRestoreData(json);
          setStatusMessage({ text: 'تم استيراد الملف المحلي واستعادة البيانات بنجاح!', type: 'success' });
        } else {
          setStatusMessage({ text: 'ملف غير صالح، يرجى اختيار ملف نسخة احتياطية سليم.', type: 'error' });
        }
      } catch (err) {
        setStatusMessage({ text: 'تعذر قراءة الملف، تأكدي من صيغة JSON.', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">الحفظ السحابي واستعادة البيانات</h2>
              <p className="text-xs text-pink-100">
                Google Drive والتخزين المحلي لحماية بيانات خزينكِ وميزانيتكِ ويومياتك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-sm">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              ) : (
                <RotateCcw className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
              )}
              <span className="font-medium leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Google Account Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  حساب Google Drive
                </span>
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full border border-purple-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        {currentUser.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-800">{currentUser.displayName || 'مستخدم'}</p>
                      <p className="text-xs text-slate-500">{currentUser.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-xs">
                    سجّلي الدخول بحساب Google لربط ملف النسخة الاحتياطية على درايف الخاص بكِ.
                  </p>
                )}
              </div>

              <div>
                {currentUser ? (
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={isAuthenticating}
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-300 shadow-xs hover:bg-slate-50 transition text-slate-700 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    {isAuthenticating ? 'جاري الاتصال...' : 'تسجيل الدخول بـ Google'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Drive Actions */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-purple-600" />
              إجراءات Google Drive
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleBackupNow}
                disabled={!currentUser || isBackingUp}
                className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold hover:opacity-95 shadow-md shadow-pink-500/20 disabled:opacity-50 transition"
              >
                {isBackingUp ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span>حفظ نسخة احتياطية الآن</span>
              </button>

              <button
                onClick={() => accessToken && fetchBackupsList(accessToken)}
                disabled={!currentUser}
                className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 font-bold hover:bg-purple-100 disabled:opacity-50 transition"
              >
                <RefreshCw className="w-5 h-5" />
                <span>تحديث قائمة النسخ على درايف</span>
              </button>
            </div>

            {appData.lastBackupDate && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                آخر حفظ للنسخة: {formatArabicDateTime(appData.lastBackupDate)}
              </p>
            )}

            {/* Backups list in Drive */}
            {currentUser && (
              <div className="mt-4 border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <h4 className="font-semibold text-xs text-slate-600 mb-3">
                  الملفات المتاحة للاستعادة على Google Drive:
                </h4>
                {backups.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">لا توجد نسخ احتياطية مسجلة بعد على درايف.</p>
                ) : (
                  <div className="space-y-2">
                    {backups.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-200 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{b.name}</p>
                          <p className="text-slate-400 text-[11px]">
                            تاريخ الحفظ: {formatArabicDateTime(b.modifiedTime)}
                          </p>
                        </div>
                        <button
                          onClick={() => setConfirmRestoreFile(b)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200 flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          استعادة
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Local Export / Import Fallback */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              النسخ الاحتياطي المحلي (على جهازكِ)
            </h3>
            <p className="text-xs text-slate-500">
              يمكنكِ أيضاً تحميل نسخة احتياطية كملف على هاتفك أو كمبيوترك في أي وقت بدون إنترنت.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => exportDataAsJsonFile(appData)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                <Download className="w-4 h-4" />
                تحميل ملف النسخة (JSON)
              </button>

              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>استيراد ملف نسخة سابقة</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleLocalImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Mandatory Confirmation Modal for Workspace Data Restoration */}
        {confirmRestoreFile && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 text-right space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center">
                تأكيد استعادة النسخة الاحتياطية
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed text-center">
                هل أنتِ متأكدة من استعادة الملف{' '}
                <strong className="text-slate-900 font-bold">{confirmRestoreFile.name}</strong>؟
                <br />
                سيتم استبدال بيانات التطبيق الحالية (الخزين، المشتريات، الميزانية، والصلوات) بالبيانات المحفوظة في هذه النسخة.
              </p>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setConfirmRestoreFile(null)}
                  disabled={isRestoring}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmRestore}
                  disabled={isRestoring}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs"
                >
                  {isRestoring ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  نعم، استعادة البيانات الآن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
