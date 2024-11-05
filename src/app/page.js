"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import styles from "./page.module.css";
import { countries, formats, genres } from "./const";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
import { setPage } from "@/toolkitRedux/paginationSlice";

const filmSchema = z.object({
  projectName: z.string().min(1, "Заполните поле"),
  genre: z.string().min(1, "Заполните поле"),
  format: z.string().min(1, "Заполните поле"),
  unfNumber: z.string().regex(/^\d{3}-\d{3}-\d{2}-\d{3}$/, "Неверный формат УНФ").or(z.literal("")).optional(),
  country: z.string().min(1, "Заполните поле"),
  cost: z.number().min(0, "Неверный формат стоимости").optional(),
  synopsis: z.string().optional(),
});

const InputField = ({ label, name, type = "text", value, onChange, error, options }) => {
  return (
    <div className={styles.input}>
      <label>{label}</label>
      {type === "select" ? (
        <select name={name} value={value} onChange={onChange} className={error ? styles.customSelectError : styles.customSelect}>
          <option>{label === "Страна-производитель (копродукция)" ? "Cтрана" : label}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={label === "№ УНФ или отсутствует" ? "890-000-000-00-000" : label}
          value={value}
          onChange={onChange}
          className={error ? styles.inputError : styles.inputNotError}
        />
      )}
      {error && <span className={styles.error_text}>{error._errors}</span>}
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentPage = useSelector((state) => state.pagination.currentPage);

  const [formState, setFormState] = useState({
    values: {
      projectName: "",
      genre: "",
      format: "",
      unfNumber: "",
      country: "",
      cost: 0,
      synopsis: "",
    },
    errors: {},
  });

  useEffect(() => {
    if (router.pathname === "/") {
      dispatch(setPage(1));
    }
  }, [router.pathname, dispatch]);

  useEffect(() => {
    const savedFormValues = JSON.parse(localStorage.getItem("filmFormValues"));
    if (savedFormValues) {
      setFormState((prev) => ({ ...prev, values: savedFormValues }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'cost' ? Number(value) : value;

    setFormState((prev) => {
      const updatedValues = { ...prev.values, [name]: newValue };
      localStorage.setItem("filmFormValues", JSON.stringify(updatedValues));

      const fieldResult = filmSchema.pick({ [name]: true }).safeParse({ [name]: newValue });
      const newErrors = fieldResult.success ? { ...prev.errors } : { ...prev.errors, [name]: fieldResult.error.format()[name] };

      return { values: updatedValues, errors: newErrors };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationResult = filmSchema.safeParse(formState.values);

    if (!validationResult.success) {
      setFormState((prev) => ({ ...prev, errors: validationResult.error.format() }));
    } else {
      setFormState((prev) => ({ ...prev, errors: {} }));
      router.push(`/step-${currentPage + 1}`);
    }
  };

  const handleReset = () => {
    setFormState({
      values: {
        projectName: "",
        genre: "",
        format: "",
        unfNumber: "",
        country: "",
        cost: 0,
        synopsis: "",
      },
      errors: {},
    });
    localStorage.removeItem("filmFormValues");
  };

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <div className={styles.title}>
        <h1>Производственные параметры фильма</h1>
        <button type="button" onClick={handleReset}>Отменить заполнение</button>
      </div>
      <div className={styles.wrapper}>
        <div className={styles.inputs}>
          <InputField label="Название проекта" name="projectName" value={formState.values.projectName} onChange={handleChange} error={formState.errors.projectName} />
          <InputField label="Жанр" name="genre" type="select" value={formState.values.genre} onChange={handleChange} error={formState.errors.genre} options={genres} />
          <InputField label="Формат" name="format" type="select" value={formState.values.format} onChange={handleChange} error={formState.errors.format} options={formats} />
          <InputField label="№ УНФ или отсутствует" name="unfNumber" value={formState.values.unfNumber} onChange={handleChange} error={formState.errors.unfNumber} />
        </div>
        <div className={styles.inputs}>
          <InputField label="Страна-производитель (копродукция)" name="country" type="select" value={formState.values.country} onChange={handleChange} error={formState.errors.country} options={countries} />
          <InputField label="Сметная стоимость" name="cost" type="number" value={formState.values.cost !== 0 ? formState.values.cost : ""} onChange={handleChange} error={formState.errors.cost} />
          <div className={styles.input}>
            <label>Синопсис</label>
            <textarea
              id={styles.synopsis}
              name="synopsis"
              placeholder="Напишите краткое изложение"
              value={formState.values.synopsis}
              onChange={handleChange}
              className={styles.inputNotError}
            />
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <div></div>
        <div className={styles.pagination}>
          {[1, 2, 3, 4].map((page) => (
            <span key={page} className={currentPage === page ? styles.active : styles.pages}>{page}</span>
          ))}
          <ArrowForwardIcon onClick={() => handlePageChange(currentPage)} style={{ cursor: "pointer" }} />
        </div>
        <button type="submit">
          <div className={Object.keys(formState.errors).length === 0 ? styles.wrapperButton : styles.wrapperButtonDisabled}>
            <span>Следующий шаг</span> <ArrowForwardIcon sx={{ color: "#ACACAC" }} />
          </div>
        </button>
      </div>
    </form>
  );
}
