"use client";

import useGetFaqs from "@/hooks/GET/useGetFaqs";
import Loading from "../loading";
import { AlertCircle, ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import classes from "./SikcaSorulanSorular.module.css";
import {
  faqsAnswerVariants,
  faqsItemVariants,
  faqsSectionVariants,
} from "../utils/animations";

export default function SikcaSorulanSorular() {
  const router = useRouter();
  const [faqAnswerDisplay, setFaqAnswerDisplay] = useState(null);

  const {
    data: getFaqsData,
    isLoading: getFaqsIsLoading,
    isError: getFaqsIsError,
    error: getFaqsError,
  } = useGetFaqs();

  if (getFaqsIsLoading) {
    return <Loading />;
  }

  if (getFaqsIsError) {
    return (
      <div className={classes.pageWrapper}>
        <motion.div
          className={classes.errorContainer}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AlertCircle size={48} className={classes.iconSecondary} />
          <h2>Bir Hata Oluştu</h2>
          <p>{getFaqsError?.message}</p>
          <button onClick={() => router.back()} className={classes.backButton}>
            <ArrowLeft size={20} /> Geri Dön
          </button>
        </motion.div>
      </div>
    );
  }

  const faqs = getFaqsData?.result || [];

  const groupedFaqs = faqs.reduce((acc, faq) => {
    const categoryName = faq.category || "Diğer";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(faq);
    return acc;
  }, {});

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.faqPageContainer}>
        <motion.div
          className={classes.faqHeader}
          variants={faqsSectionVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className={classes.mainTitle} variants={faqsItemVariants}>
            <HelpCircle className={classes.titleIcon} size={36} />
            <span>
              <span className={classes.brandHighlight}>Sıkça Sorulan</span>{" "}
              Sorular
            </span>
          </motion.h1>
          <motion.p className={classes.faqSubtitle} variants={faqsItemVariants}>
            YapayOto platformu, yapay zeka özellikleri ve alım-satım süreçleri
            hakkında merak ettiğiniz her şey.
          </motion.p>
        </motion.div>

        {Object.entries(groupedFaqs).map(([categoryName, categoryFaqs]) => (
          <motion.div
            key={categoryName}
            className={classes.faqCategoryGroup}
            variants={faqsSectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <motion.h2
              className={classes.categoryTitle}
              variants={faqsItemVariants}
            >
              {categoryName}
            </motion.h2>

            <div className={classes.faqList}>
              {categoryFaqs.map((faq) => {
                const isOpen = faqAnswerDisplay === faq.id;

                return (
                  <motion.div
                    key={faq.id}
                    variants={faqsItemVariants}
                    className={`${classes.faqCard} ${
                      isOpen ? classes.active : ""
                    }`}
                    onClick={() =>
                      setFaqAnswerDisplay((prev) =>
                        prev === faq.id ? null : faq.id,
                      )
                    }
                  >
                    <div className={classes.faqQuestionWrapper}>
                      <h3>{faq.question}</h3>
                      <ChevronDown
                        className={`${classes.iconChevron} ${
                          isOpen ? classes.rotated : ""
                        }`}
                        size={20}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.p
                          className={classes.faqAnswer}
                          variants={faqsAnswerVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          {faq.answer}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
