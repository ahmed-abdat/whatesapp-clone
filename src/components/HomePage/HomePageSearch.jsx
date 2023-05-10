import { useState } from "react";
import { BsX } from "react-icons/bs";
import { HiSearch } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";

export default function HomepageSearch({
  isUnreadMessageShow,
  isUnreadMessage,
  setIsUnreadMessage,
  search,
  setSearch,
}) {
  // is Arabic
  const isArabicText = (text) => {
    if (text.length < 1) return true;
    return /[\u0600-\u06FF]/.test(text);
  };

  // handel change
  const handelChnage = (e) => {
    const { value } = e.target;
    setSearch(value);
  };

  // handel clear
  const handelClear = () => {
    setSearch("");
  };
  return (
    <div className="search--container">
      <div className="input">
        <HiSearch />
        <input
          type="text"
          placeholder="البحث عن دردشة أو بدء دردشة جديدة"
          onChange={handelChnage}
          value={search}
          className={isArabicText(search) ? "dr-ar" : "dr-en"}
        />
        {search.length > 0 && <BsX onClick={handelClear} />}
      </div>
      {isUnreadMessageShow && (
        <div
          className={`icon ${isUnreadMessage && "unred-bg"}`}
          onClick={() => setIsUnreadMessage((prev) => !prev)}
        >
          <MdFilterList />
        </div>
      )}
    </div>
  );
}
