"use client";

import Image from "next/image";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import classes from "./CreditCard.module.css";

const CreditCard = forwardRef((props, ref) => {
  const [cardNumberParts, setCardNumberParts] = useState(["", "", "", ""]);
  const [cardName, setCardName] = useState("");
  const [cardExpireDateParts, setCardExpireDatePars] = useState(["", ""]);
  const cardNumberInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const cardExpireDateInputRefs = [useRef(null), useRef(null)];
  const [cardErrors, setCardErrors] = useState({
    number: [null, null, null, null],
    name: null,
    expireDate: [null, null],
  });

  function cardNumberInputChangeHandler(index, event) {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setCardNumberParts((prev) => {
        const currentParts = [...prev];
        currentParts[index] = value;
        return currentParts;
      });
    }

    if (value.length === 4 && index < 3) {
      cardNumberInputRefs[index + 1].current.focus();
    }
  }

  function cardNameInputChangeHandler(event) {
    let value = event.target.value;
    value = value.replace(/[çÇğĞıİöÖşŞüÜ]/g, (match) => {
      const charMap = {
        ç: "c",
        Ç: "C",
        ğ: "g",
        Ğ: "G",
        ı: "i",
        İ: "I",
        ö: "o",
        Ö: "O",
        ş: "s",
        Ş: "S",
        ü: "u",
        Ü: "U",
      };
      return charMap[match];
    });
    value = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    setCardName(value);
  }

  function cardExpireDateInputChangeHandler(index, event) {
    let value = event.target.value.replace(/\D/g, "");

    if (index === 0) {
      if (value.length === 1 && parseInt(value) > 1) {
        value = "0" + value;
      }
      if (value.length === 2) {
        if (parseInt(value) > 12) value = "12";
        if (parseInt(value) === 0) value = "01";
      }
    }

    if (value.length <= 2) {
      setCardExpireDatePars((prev) => {
        const currentParts = [...prev];
        currentParts[index] = value;
        return currentParts;
      });
    }

    if (value.length === 2 && index === 0) {
      cardExpireDateInputRefs[1].current.focus();
    }
  }

  function cardExpireDateInputBlurHandler(index, event) {
    let value = event.target.value.replace(/\D/g, "");

    if (index === 0) {
      if (value.length === 1 && parseInt(value) > 0) {
        value = "0" + value;
      }
      if (value.length === 2) {
        if (parseInt(value) > 12) value = "12";
        if (parseInt(value) === 0) value = "01";
      }

      if (value !== cardExpireDateParts[0]) {
        setCardExpireDatePars((prev) => {
          const currentParts = [...prev];
          currentParts[0] = value;
          return currentParts;
        });
      }

      setCardErrors((prev) => {
        const newExpireErrors = [...prev.expireDate];
        if (value.length === 0) {
          newExpireErrors[0] = "Eksik alan!";
        } else if (value.length < 2) {
          newExpireErrors[0] = "Ay eksik!";
        } else {
          newExpireErrors[0] = null;
        }
        return { ...prev, expireDate: newExpireErrors };
      });
    } else if (index === 1) {
      let formattedValue = value;
      if (formattedValue !== "") {
        if (formattedValue.length === 1) {
          formattedValue = "0" + formattedValue;
        }
        const currentYear = new Date().getFullYear().toString().slice(-2);
        if (Number(formattedValue) < Number(currentYear)) {
          formattedValue = currentYear;
        }
        setCardExpireDatePars((prev) => {
          const currentParts = [...prev];
          currentParts[1] = formattedValue;
          return currentParts;
        });
      }

      setCardErrors((prev) => {
        const newExpireErrors = [...prev.expireDate];
        if (formattedValue.length === 0) {
          newExpireErrors[1] = "Eksik alan!";
        } else if (formattedValue.length < 2) {
          newExpireErrors[1] = "Geçerli bir tarih giriniz!";
        } else {
          newExpireErrors[1] = null;
        }
        return { ...prev, expireDate: newExpireErrors };
      });
    }
  }

  function cardNumberInputKeyDownHandler(index, event) {
    if (
      event.key === "Backspace" &&
      cardNumberParts[index] === "" &&
      index > 0
    ) {
      cardNumberInputRefs[index - 1].current.focus();
    }
  }

  function cardExpireDateInputKeyDownHandler(index, event) {
    if (
      event.key === "Backspace" &&
      cardExpireDateParts[index] === "" &&
      index === 1
    ) {
      cardExpireDateInputRefs[index - 1].current.focus();
    }
  }

  function validateNumberBlock(index, event) {
    const value = event.target.value;
    setCardErrors((prev) => {
      const newNumberErrors = [...prev.number];
      if (value.length > 0 && value.length < 4) {
        newNumberErrors[index] = "4 hane giriniz!";
      } else if (value.length === 0) {
        newNumberErrors[index] = "Eksik alan!";
      } else {
        newNumberErrors[index] = null;
      }
      return { ...prev, number: newNumberErrors };
    });
  }

  function validateName(event) {
    const value = event ? event.target.value : cardName;
    setCardErrors((prev) => ({
      ...prev,
      name: value.length < 5 ? "Lütfen ad soyad bilgisini tam giriniz!" : null,
    }));
  }

  const firstCardNumberBlock = cardNumberParts[0];

  let cardTypeLogoSrc = "/images/mastercard-logo.svg";
  let cardTypeLogoText = "Mastercard";
  let cardTypeLogoAlt = "mastercard logo";

  if (firstCardNumberBlock.startsWith("4")) {
    cardTypeLogoSrc = "/images/visa-logo.svg";
    cardTypeLogoText = "VISA";
    cardTypeLogoAlt = "visa logo";
  } else if (/^(5[1-5]|2[2-7])/.test(firstCardNumberBlock)) {
    cardTypeLogoSrc = "/images/mastercard-logo.svg";
    cardTypeLogoText = "Mastercard";
    cardTypeLogoAlt = "mastercard logo";
  }

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      let isValid = true;
      const newErrors = {
        number: [null, null, null, null],
        name: null,
        expireDate: [null, null],
      };

      cardNumberParts.forEach((part, index) => {
        if (part.length === 0) {
          newErrors.number[index] = "Eksik alan!";
          isValid = false;
        } else if (part.length < 4) {
          newErrors.number[index] = "4 hane giriniz!";
          isValid = false;
        }
      });

      if (cardName.length < 5) {
        newErrors.name = "Lütfen ad soyad bilgisini tam giriniz!";
        isValid = false;
      }

      if (cardExpireDateParts[0].length === 0) {
        newErrors.expireDate[0] = "Eksik alan!";
        isValid = false;
      } else if (cardExpireDateParts[0].length < 2) {
        newErrors.expireDate[0] = "Ay eksik!";
        isValid = false;
      }

      if (cardExpireDateParts[1].length === 0) {
        newErrors.expireDate[1] = "Eksik alan!";
        isValid = false;
      } else if (cardExpireDateParts[1].length < 2) {
        newErrors.expireDate[1] = "Geçerli bir tarih giriniz!";
        isValid = false;
      }

      setCardErrors(newErrors);

      return isValid;
    },
  }));

  return (
    <div className={classes.cardDiv}>
      <div className={classes.cardContainer}>
        <div className={classes.cardTypeDiv}>
          <h2 className={classes.cardTypeText}>{cardTypeLogoText}</h2>
          <Image
            className={classes.cardLogo}
            src={cardTypeLogoSrc}
            alt={cardTypeLogoAlt}
            width={75}
            height={58}
            priority
          />
        </div>

        <div className={classes.cardTemplateDiv}>
          <CreditCardIcon className={classes.cardIcon} color="#D4AF37" />
        </div>

        <div className={classes.numberTextDiv}>
          <h2 className={classes.cardNumberText}>NUMBER</h2>
          <div className={classes.cardNumberWrapper}>
            <div className={classes.cardNumberContainer}>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className={classes.cardNumberStarDiv}>
                  <input
                    className={classes.cardNumberInput}
                    ref={cardNumberInputRefs[index]}
                    value={cardNumberParts[index]}
                    onChange={(event) =>
                      cardNumberInputChangeHandler(index, event)
                    }
                    onKeyDown={(event) =>
                      cardNumberInputKeyDownHandler(index, event)
                    }
                    onBlur={(event) => validateNumberBlock(index, event)}
                    placeholder="****"
                    maxLength={4}
                  />
                  <hr className={classes.hr} />
                  {cardErrors.number[index] && (
                    <p className={classes.errorMessage}>
                      {cardErrors.number[index]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={classes.nameExpireDateDiv}>
          <div className={classes.nameUserNameDiv}>
            <div className={classes.nameDiv}>
              <h2 className={classes.nameText}>NAME</h2>
            </div>
            <div className={classes.userNameDiv}>
              <input
                className={classes.cardNameInput}
                value={cardName}
                onChange={cardNameInputChangeHandler}
                onBlur={(event) => validateName(event)}
                placeholder="NAME SURNAME"
              />
              <hr className={classes.nameHr} />
              {cardErrors.name && (
                <p className={classes.errorMessage}>{cardErrors.name}</p>
              )}
            </div>
          </div>

          <div className={classes.expireDiv}>
            <div className={classes.exprireDateTextDiv}>
              <h2 className={classes.exprireDateText}>EXPIRE DATE</h2>
            </div>
            <div className={classes.expireDateDiv}>
              {[0, 1].map((index) => (
                <div key={index} className={classes.expireDateWrapper}>
                  <div className={classes.expireDateContainer}>
                    <input
                      className={classes.cardExpireDateInput}
                      ref={cardExpireDateInputRefs[index]}
                      value={cardExpireDateParts[index]}
                      onChange={(event) =>
                        cardExpireDateInputChangeHandler(index, event)
                      }
                      onBlur={(event) =>
                        cardExpireDateInputBlurHandler(index, event)
                      }
                      onKeyDown={(event) =>
                        cardExpireDateInputKeyDownHandler(index, event)
                      }
                      maxLength={2}
                      placeholder={index === 0 ? "MM" : "YY"}
                    />
                    <hr className={classes.expireDatehr} />
                    {cardErrors.expireDate[index] && (
                      <p className={classes.errorMessage}>
                        {cardErrors.expireDate[index]}
                      </p>
                    )}
                  </div>
                  {index === 0 && <h2 className={classes.dateText}>/</h2>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CreditCard;
