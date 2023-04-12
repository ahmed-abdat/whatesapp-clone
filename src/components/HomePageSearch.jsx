import { BsX } from "react-icons/bs";
import { HiSearch } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";

export default function HomepageSearch() {
  return (
    <div className="search--container">
      <div className="input">
        <HiSearch />
        <input type="text" placeholder="البحث عن دردشة أو بدء دردشة جديدة" />
        <BsX />
      </div>
      <MdFilterList />
    </div>
  );
}
