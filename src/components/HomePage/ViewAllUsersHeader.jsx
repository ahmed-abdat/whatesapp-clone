import { ArrowLeft } from "lucide-react";
export default function ViewAllUsersHeader({ setIsAllUsersShow, usersLength }) {
  return (
    <header className="bg-whatsapp-primary flex items-center justify-between font-vazirmatn w-full max-h-full p-4 text-white">
      <div className="flex items-center gap-4">
        <ArrowLeft
          className="h-5 w-5 rotate-180 cursor-pointer"
          onClick={() => setIsAllUsersShow(false)}
        />
        <div className="font-arabic">
          <h4 className="text-lg font-normal"> جهات الإتصال </h4>
          <p className="text-sm">
            {" "}
            <span>{usersLength}</span> جهة إتصال{" "}
          </p>
        </div>
      </div>
    </header>
  );
}
