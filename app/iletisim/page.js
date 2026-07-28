"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, Mail, MessageSquare } from "lucide-react";
import Input from "../components/Input";
import classes from "./Iletisim.module.css";
import { dropdownVariants } from "../utils/animations";
import SecondaryButton from "../components/SecondaryButton";
import { useSelector } from "react-redux";
import { usePostContact } from "@/hooks/POST/usePostContact";
import SuccessMessage from "../components/SuccessMessage";

export default function Iletisim() {
  const user = useSelector((state) => state.auth.user);
  const {
    mutate: postContactMutate,
    isPending: postContactIsPending,
    isError: postContactIsError,
    error: postContactError,
  } = usePostContact();

  const [value, setValue] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    subject: "Konu",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formHeight, setFormHeight] = useState(null);

  const dropdownRef = useRef(null);
  const formSectionRef = useRef(null);

  const subjectOptions = [
    "Teknik Destek",
    "İlan İşlemleri",
    "İş Birliği / Reklam",
    "Genel Görüş / Öneri",
    "Şikayet Bildirimi",
  ];

  useEffect(() => {
    if (user) {
      setValue((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        surname: prev.surname || user.surname || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    let timer;
    if (isSuccess) {
      timer = setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (openDropdown === "subject") {
          setTouched((prev) => ({ ...prev, subject: true }));
          setErrors((prev) => ({
            ...prev,
            subject: validate("subject", value.subject),
          }));
        }
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown, value.subject]);

  const validate = (name, val) => {
    let error = "";
    if (name === "name" && !val.trim()) {
      error = "İsim alanı zorunludur.";
    }
    if (name === "surname" && !val.trim()) {
      error = "Soyisim alanı zorunludur.";
    }
    if (name === "email") {
      if (!val.trim()) {
        error = "E-posta alanı zorunludur.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        error = "Geçerli bir e-posta adresi giriniz.";
      }
    }
    if (name === "subject" && val === "Konu") {
      error = "Lütfen bir konu seçiniz.";
    }
    if (name === "message" && !val.trim()) {
      error = "Mesaj alanı zorunludur.";
    }
    return error;
  };

  function inputChangeHandler(event) {
    const { name, value: val } = event.target;
    setValue((prev) => ({ ...prev, [name]: val }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, val) }));
    }
  }

  function handleBlur(event) {
    const { name, value: val } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, val) }));
  }

  function submitHandler(event) {
    event.preventDefault();

    const newErrors = {
      name: validate("name", value.name),
      surname: validate("surname", value.surname),
      email: validate("email", value.email),
      subject: validate("subject", value.subject),
      message: validate("message", value.message),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      surname: true,
      email: true,
      subject: true,
      message: true,
    });

    const hasErrors = Object.values(newErrors).some((err) => err !== "");

    if (!hasErrors) {
      if (formSectionRef.current) {
        setFormHeight(formSectionRef.current.offsetHeight);
      }

      const payload = {
        name: value.name.trim(),
        surname: value.surname.trim(),
        email: value.email.trim(),
        subject: value.subject.trim(),
        message: value.message.trim(),
      };

      postContactMutate(
        { body: payload },
        {
          onSuccess: () => {
            setIsSuccess(true);
            setValue({
              name: user?.name || "",
              surname: user?.surname || "",
              email: user?.email || "",
              subject: "Konu",
              message: "",
            });
            setTouched({});
            setErrors({});
          },
        },
      );
    }
  }

  const apiErrorMessage =
    postContactError?.response?.data?.message ||
    postContactError?.message ||
    "Bir sorun oluştu. Lütfen tekrar deneyiniz.";

  return (
    <div className={classes.contactContainer}>
      <div className={classes.wrapper}>
        <motion.div
          className={classes.infoSection}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={classes.mainTitle}>
            <Headphones className={classes.titleIcon} size={40} />
            <span>
              Bize <span className={classes.brandHighlight}>Ulaşın</span>
            </span>
          </h1>
          <p className={classes.paragraph}>
            Sorularınız, görüşleriniz veya iş birlikleri için buradayız.
            Ekibimiz size en kısa sürede dönüş yapacaktır.
          </p>

          <div className={classes.contactCards}>
            <div className={classes.contactCard}>
              <Mail className={classes.cardIcon} size={28} />
              <div>
                <strong>Genel Destek</strong>
                <span>info@yapayoto.com.tr</span>
              </div>
            </div>
            <div className={classes.contactCard}>
              <MessageSquare className={classes.cardIcon} size={28} />
              <div>
                <strong>İş Birliği & Reklam</strong>
                <span>partnerships@yapayoto.com.tr</span>
              </div>
            </div>
          </div>
        </motion.div>

        {!isSuccess ? (
          <motion.div
            ref={formSectionRef}
            className={classes.formSection}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form
              method="POST"
              onSubmit={submitHandler}
              className={classes.form}
            >
              {postContactIsError && (
                <div className={classes.serverErrorBox}>{apiErrorMessage}</div>
              )}

              <div className={classes.row}>
                <div className={classes.inputWrapper}>
                  <Input
                    identifier="name"
                    name="name"
                    type="text"
                    onChange={inputChangeHandler}
                    onBlur={handleBlur}
                    value={value.name}
                    label="İsim"
                  />
                  {touched.name && errors.name && (
                    <span className={classes.fieldErrorText}>
                      {errors.name}
                    </span>
                  )}
                </div>
                <div className={classes.inputWrapper}>
                  <Input
                    identifier="surname"
                    name="surname"
                    type="text"
                    onChange={inputChangeHandler}
                    onBlur={handleBlur}
                    value={value.surname}
                    label="Soyisim"
                  />
                  {touched.surname && errors.surname && (
                    <span className={classes.fieldErrorText}>
                      {errors.surname}
                    </span>
                  )}
                </div>
              </div>

              <div className={classes.inputWrapper}>
                <Input
                  identifier="email"
                  name="email"
                  type="email"
                  onChange={inputChangeHandler}
                  onBlur={handleBlur}
                  value={value.email}
                  label="E-Posta"
                />
                {touched.email && errors.email && (
                  <span className={classes.fieldErrorText}>{errors.email}</span>
                )}
              </div>

              <div className={classes.selectDiv}>
                <label>Konu</label>

                <div className={classes.dropdownWrapper} ref={dropdownRef}>
                  <div
                    onClick={() => {
                      setOpenDropdown(
                        openDropdown === "subject" ? null : "subject",
                      );
                    }}
                    className={`dropdown ${classes.customDropdown} ${
                      value.subject !== "Konu" ? classes.selected : ""
                    } ${openDropdown === "subject" ? classes.boxShadow : ""}`}
                  >
                    {value.subject}
                  </div>

                  <AnimatePresence>
                    {openDropdown === "subject" && (
                      <motion.ul
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`dropdownList ${classes.dropdownMenu}`}
                      >
                        {subjectOptions.map((option) => (
                          <li
                            key={option}
                            onClick={() => {
                              setOpenDropdown(null);
                              setValue((prevValue) => ({
                                ...prevValue,
                                subject: option,
                              }));
                              setTouched((prev) => ({
                                ...prev,
                                subject: true,
                              }));
                              setErrors((prev) => ({
                                ...prev,
                                subject: validate("subject", option),
                              }));
                            }}
                          >
                            {option}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <input type="hidden" name="subject" value={value.subject} />
                {touched.subject && errors.subject && (
                  <span className={classes.fieldErrorText}>
                    {errors.subject}
                  </span>
                )}
              </div>

              <div className={classes.textareaDiv}>
                <label htmlFor="message">Mesajınız</label>
                <textarea
                  id="message"
                  name="message"
                  onChange={inputChangeHandler}
                  onBlur={handleBlur}
                  value={value.message}
                  className={classes.textarea}
                  rows={5}
                  placeholder="Mesajınızı buraya yazabilirsiniz..."
                />
                {touched.message && errors.message && (
                  <span className={classes.fieldErrorText}>
                    {errors.message}
                  </span>
                )}
              </div>

              <div className={classes.buttonDiv}>
                <SecondaryButton
                  text={postContactIsPending ? "Gönderiliyor..." : "Gönder"}
                  type="submit"
                  className={classes.button}
                  disabled={postContactIsPending}
                />
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            className={`${classes.formSection} ${classes.successSection}`}
            style={{ height: formHeight ? `${formHeight}px` : "auto" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <SuccessMessage
              key="success-message"
              onClick={() => setIsSuccess(false)}
              title="Mesajınız Gönderildi"
              text="Mesajınız başarılı bir şekilde tarafımıza ulaştı. En kısa sürede sizinle iletişime geçeceğiz."
              buttonText="Tamam"
              className={classes.successMessage}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
