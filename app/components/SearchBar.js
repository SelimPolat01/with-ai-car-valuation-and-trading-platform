"use client";

import { useEffect, useState } from "react";
import classes from "./SearchBar.module.css";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setAdverts } from "@/store/advertsSlice";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const allAdverts = useSelector((state) => state.adverts.allAdverts);
  const filteredData = allAdverts.filter((advert) =>
    `${advert.brand} ${advert.model}`
      .toLowerCase()
      .startsWith(query.toLowerCase())
  );
  const uniqueBrands = Array.from(
    new Set(filteredData.map((advert) => advert.brand))
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (allAdverts.length === 0) {
      async function fetchAdverts() {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/adverts`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 401) {
            localStorage.removeItem("token");
            router.replace("/login");
            return;
          }

          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.message);
            return;
          }

          const advertsData = await response.json();
          dispatch(setAdverts(advertsData));
        } catch (err) {
          console.log("Error: " + err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchAdverts();
    }
  }, [dispatch, router, allAdverts.length]);

  function inputChangeHandler(event) {
    setQuery(event.target.value);
  }

  function formSubmitHandler(event) {
    event.preventDefault();
    if (!query.trim()) return;
    router.replace(`/arama?q=${encodeURIComponent(query)}`);
  }

  function capitalize(text) {
    if (typeof text !== "string") {
      return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
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
      {query && (
        <ul className={classes.ul}>
          {uniqueBrands.map((brand, index) => (
            <li className={classes.li} onClick={() => setQuery("")} key={index}>
              <Link href={`/arama?q=${brand}`}>
                {decodeURIComponent(capitalize(brand))}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
