"use client";

import { useState } from "react";
import classes from "./SearchBar.module.css";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function inputChangeHandler(event) {
    setQuery(event.target.value);
  }

  function formSubmitHandler(event) {
    event.preventDefault();
    if (!query.trim()) return;
    router.replace(`/arama?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className={classes.div}>
      <form onSubmit={formSubmitHandler} className={classes.form}>
        <input
          type="text"
          onChange={inputChangeHandler}
          value={query}
          placeholder="İlan Ara..."
          className={classes.input}
          name="search"
        />
        <button type="submit" className={classes.button}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{ width: "22px", height: "22px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
