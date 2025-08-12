import { useState } from "react";
import { BsX } from "react-icons/bs";
import { HiSearch } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

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
      {/* Modern search input with shadcn/ui */}
      <div className="relative flex-1">
        <div className="relative">
          {/* Search icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <HiSearch className="h-4 w-4" />
          </div>
          
          {/* Search input */}
          <Input
            type="text"
            placeholder="البحث عن دردشة أو بدء دردشة جديدة"
            onChange={handelChnage}
            value={search}
            className={cn(
              "pl-10 pr-10 h-10 bg-gray-100 border-0 focus-visible:ring-2 focus-visible:ring-whatsapp-primary focus-visible:ring-offset-0 rounded-lg",
              isArabicText(search) ? "font-arabic text-right" : "text-left"
            )}
          />
          
          {/* Clear button */}
          {search.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-200"
              onClick={handelClear}
            >
              <BsX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter button */}
      {isUnreadMessageShow && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "ml-2 h-10 w-10 rounded-lg hover:bg-gray-100",
            isUnreadMessage && "bg-whatsapp-primary text-white hover:bg-whatsapp-primary-dark"
          )}
          onClick={() => setIsUnreadMessage((prev) => !prev)}
        >
          <MdFilterList className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
