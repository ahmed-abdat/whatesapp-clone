import { useState } from "react";
import { BsX } from "react-icons/bs";
import { HiSearch } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";

export default function HomepageSearch() {
  // search
  const [search, setSearch] = useState("");
  const [isSearch , setIsSearch] = useState(false);
  const [isArabic , setIsArabic] = useState(true);

  // handel change
  const handelChnage = (e) => {
    const {value} = e.target;
    const isArabic = /[\u0600-\u06FF]/.test(value);
    isArabic ? setIsArabic(true) : setIsArabic(false);
    setSearch(value);
    if (value.length > 0) {
      setIsSearch(true);
    } else {
      setIsArabic(false)
      setIsSearch(false);
    }
  };

  // handel clear
  const handelClear = () => {
    setSearch("");
    setIsSearch(false);
  };
  return (
    <div className="search--container">
      <div className="input">
        <HiSearch />
        <input type="text" placeholder="البحث عن دردشة أو بدء دردشة جديدة" onChange={handelChnage} value={search} className={isArabic ? 'dr-ar' : 'dr-en'}/>
        {isSearch && <BsX onClick={handelClear}/>}
      </div>
     <MdFilterList />
    </div>
  );
}
