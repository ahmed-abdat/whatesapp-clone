import { IoWarning } from "react-icons/io5";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export default function DeleteModule({
  moduleTitle = "delete account",
  icon = <IoWarning />,
  handelCancel,
  handelDelete,
  open = true,
  onOpenChange,
}) {
  // Handle close with both callbacks
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      onOpenChange?.(false);
      handelCancel?.();
    }
  };

  // Modern content configuration with better UX
  const getDialogContent = (moduleTitle) => {
    const configs = {
      "delete account": {
        title: "حذف الحساب نهائياً",
        description: "هذا الإجراء لا يمكن التراجع عنه. ستفقد جميع بياناتك الشخصية، المحادثات، والصور المحفوظة.",
        confirmText: "حذف الحساب",
        icon: <IoWarning className="w-6 h-6" />,
        variant: "destructive"
      },
      "delete chat": {
        title: "مسح المحادثة",
        description: "سيتم حذف جميع الرسائل والملفات المرسلة في هذه المحادثة نهائياً. هذا الإجراء لا يمكن التراجع عنه.",
        confirmText: "مسح المحادثة",
        icon: <IoWarning className="w-6 h-6" />,
        variant: "destructive"
      },
      "delete geust account": {
        title: "حذف الحساب الضيف",
        description: "عند تسجيل الخروج سيتم حذف جميع البيانات نهائياً. يمكنك ربط الحساب بجوجل لحفظ البيانات.",
        confirmText: "حذف الحساب",
        icon: <IoWarning className="w-6 h-6" />,
        variant: "destructive"
      }
    };
    return configs[moduleTitle] || configs["delete account"];
  };

  const content = getDialogContent(moduleTitle);

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md gap-6 rounded-xl">
        <AlertDialogHeader className="text-center">
          {/* Modern warning icon with proper spacing */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
              {content.icon}
            </div>
          </div>
          
          {/* Title with proper shadcn styling */}
          <AlertDialogTitle className="font-arabic text-xl font-semibold leading-tight">
            {content.title}
          </AlertDialogTitle>
          
          {/* Description with shadcn muted foreground */}
          <AlertDialogDescription className="font-arabic text-base leading-relaxed mt-2 px-4">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Footer using proper shadcn layout */}
        <AlertDialogFooter className="gap-3 sm:gap-2">
          <AlertDialogCancel className="font-arabic h-11 flex-1 sm:flex-initial">
            إلغاء
          </AlertDialogCancel>
          
          <AlertDialogAction 
            className="font-arabic h-11 flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 focus:ring-red-600"
            onClick={handelDelete}
          >
            {content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
