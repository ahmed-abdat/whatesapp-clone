import { IoWarning } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import "./styles/DeleteModule.css";

export default function DeleteModule({
  moduleTitle = "delete account",
  icon = <IoWarning />,
  handelCancel,
  handelDelete,
}) {
  let info;
  let title;
  let deleteBtnText;
  if (moduleTitle === "delete account") {
    title = "هل أنت متأكد من حذف حسابك ؟";
    info =
      "ستفقد الوصول إلى جميع بياناتك الشخصية بما في ذلك ملفك الشخصي و جميع مراسلاتك وجميع صورك ولن تستطيع إستعادتها مرة أخرى";
    deleteBtnText = "نعم , حذف حسابي";
  } else if (moduleTitle === "delete chat") {
    title = "هل تريد مسح محتوى هذه الدردشة ؟";
    info =
      "سيتم حذف جميع الرسائل والصور والملفات والروابط التي تم مشاركتها في هذه الدردشة ولن تستطيع إستعادتها مرة أخرى";
    deleteBtnText = "نعم , مسح الدردشة";
  } else if (moduleTitle === "delete geust account") {
    title = "هل أنت متأكد من حذف حسابك ؟";
    info =
      " عند تسجيل خروجك من حساب ضيف سيتم حذف جميع بياناتك الشخصية بما في ذلك ملفك الشخصي و جميع مراسلاتك وجميع صورك ولن تستطيع إستعادتها مرة أخرى , قم بربط حسابك بحساب جوجل لحفظ بياناتك ";
    deleteBtnText = "نعم , حذف حسابي";
  }
  return (
    <div className="module d-f">
      <div className="module--container">
        <div className="close" onClick={handelCancel}>
          <MdClose />
        </div>
        <div className="icon d-f">{icon}</div>
        <div className="module--title f-ar">
          <h3>{title}</h3>
        </div>
        <div className="module--info f-ar">
          <p>{info}</p>
        </div>
        <div className="btns">
          <button className="btn btn--cancel f-ar" onClick={handelCancel}>
            لا , إلغاء
          </button>
          <button className="btn btn--delete f-ar" onClick={handelDelete}>
            {deleteBtnText}
          </button>
        </div>
      </div>
    </div>
  );
}
