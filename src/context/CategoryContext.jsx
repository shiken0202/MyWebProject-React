import React, { createContext, useContext, useState, useEffect } from "react";

const CategoryContext = createContext();

export function useCategory() {
  return useContext(CategoryContext);
}

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/categories", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.data || []);
        setMainCategories((data.data || []).filter((c) => c.parentId === null));
        setSubCategories((data.data || []).filter((c) => c.parentId !== null));
      });
  }, []);
  // 根據名稱找主分類
  const findMainCategoryByName = (name) =>
    mainCategories.find((cat) => cat.name === name);

  // 根據名稱和主分類ID找子分類
  const findSubCategoryByName = (name, parentId) =>
    subCategories.find((cat) => cat.name === name && cat.parentId === parentId);
  return (
    <CategoryContext.Provider
      value={{
        categories,
        mainCategories,
        subCategories,
        findMainCategoryByName,
        findSubCategoryByName,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}
