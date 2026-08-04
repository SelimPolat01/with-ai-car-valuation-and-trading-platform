"use client";

import useGetFaqs from "@/hooks/GET/useGetFaqs";
import Loading from "../loading";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import classes from "./SikcaSorulanSorular.module.css";
import {
  faqsAnswerVariants,
  faqsItemVariants,
  faqsSectionVariants,
} from "../utils/animations";

export default function SikcaSorulanSorular() {
  const [faqAnswerDisplay, setFaqAnswerDisplay] = useState(null);

  const { data: getFaqsData, isLoading: getFaqsIsLoading } = useGetFaqs();

  if (getFaqsIsLoading) {
    return <Loading />;
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
                        <motion.div
                          className={classes.faqAnswerWrapper}
                          variants={faqsAnswerVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <p className={classes.faqAnswer}>{faq.answer}</p>
                        </motion.div>
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
