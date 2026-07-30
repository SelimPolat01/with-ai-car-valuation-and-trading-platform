import Input from "@/app/components/Input";
import SecondaryButton from "@/app/components/SecondaryButton";
import classes from "./RegisterDetailsStep.module.css";

const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;

  const slicedNumber = phoneNumber.slice(0, 10);

  if (phoneNumberLength < 4) return slicedNumber;
  if (phoneNumberLength < 7) {
    return `(${slicedNumber.slice(0, 3)}) ${slicedNumber.slice(3)}`;
  }
  if (phoneNumberLength < 9) {
    return `(${slicedNumber.slice(0, 3)}) ${slicedNumber.slice(3, 6)} ${slicedNumber.slice(6)}`;
  }
  return `(${slicedNumber.slice(0, 3)}) ${slicedNumber.slice(3, 6)} ${slicedNumber.slice(6, 8)} ${slicedNumber.slice(8, 10)}`;
};

const formatIBAN = (value) => {
  if (!value) return value;

  let cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (/^\d/.test(cleaned)) {
    cleaned = "TR" + cleaned;
  } else if (cleaned.length > 0 && !cleaned.startsWith("T")) {
    cleaned = "TR" + cleaned;
  }

  cleaned = cleaned.slice(0, 26);

  const match = cleaned.match(/.{1,4}/g);
  if (match) {
    return match.join(" ");
  }
  return cleaned;
};

export default function RegisterDetailsStep({
  input,
  inputChangeHandler,
  inputBlurHandler,
  setBlurForFields,
  router,
  mutate,
  isPending,
  isError,
  error,
}) {
  const isNameValid = input.name.value.trim().length > 0;
  const isSurnameValid = input.surname.value.trim().length > 0;
  const isPasswordValid = input.password.value.trim().length >= 6;
  const isTelValid = input.tel_number.value.replace(/\D/g, "").length === 10;
  const isAddressValid = input.address.value.trim().length > 0;
  const isIbanValid = input.iban.value.replace(/\s/g, "").length >= 26;

  const localInputChangeHandler = (event) => {
    let { name, value } = event.target;

    if (name === "tel_number") {
      event.target.value = formatPhoneNumber(value);
    } else if (name === "iban") {
      event.target.value = formatIBAN(value);
    }

    inputChangeHandler(event);
  };

  function submitHandler(event) {
    event.preventDefault();
    setBlurForFields([
      "name",
      "surname",
      "password",
      "tel_number",
      "address",
      "iban",
    ]);

    if (
      !isNameValid ||
      !isSurnameValid ||
      !isPasswordValid ||
      !isTelValid ||
      !isAddressValid ||
      !isIbanValid
    ) {
      return;
    }

    const body = {
      email: input.email.value,
      otp: input.otp.value,
      password: input.password.value,
      name: input.name.value,
      surname: input.surname.value,
      tel_number: input.tel_number.value.replace(/\D/g, ""),
      address: input.address.value,
      iban: input.iban.value.replace(/\s/g, ""),
    };

    mutate(
      { body },
      {
        onSuccess: () => {
          router.replace("/login");
        },
      },
    );
  }

  return (
    <>
      <div className={classes.pageHeading}>
        <h1>Kayıt Bilgileri</h1>
        <span className={classes.subHeading}>
          Lütfen hesap detaylarınızı eksiksiz doldurun.
        </span>
      </div>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.nameSurnameDiv}>
          <div className={classes.inputColumn}>
            <Input
              className={classes.input}
              type="text"
              identifier="name"
              name="name"
              onChange={inputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.name.value}
              label="Ad"
              autoFocus
            />
            {input.name.isBlur && !isNameValid && (
              <p className={classes.error}>Ad alanı boş bırakılamaz.</p>
            )}
          </div>

          <div className={classes.inputColumn}>
            <Input
              className={classes.input}
              type="text"
              identifier="surname"
              name="surname"
              onChange={inputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.surname.value}
              label="Soyad"
            />
            {input.surname.isBlur && !isSurnameValid && (
              <p className={classes.error}>Soyad alanı boş bırakılamaz.</p>
            )}
          </div>
        </div>

        <div className={classes.nameSurnameDiv}>
          <div className={classes.inputColumn}>
            <Input
              className={classes.input}
              type="password"
              identifier="password"
              name="password"
              onChange={inputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.password.value}
              label="Şifre"
            />
            {input.password.isBlur && !isPasswordValid && (
              <p className={classes.error}>Şifre en az 6 karakter olmalıdır.</p>
            )}
          </div>

          <div className={classes.inputColumn}>
            <Input
              className={classes.input}
              type="tel"
              identifier="tel_number"
              name="tel_number"
              onChange={localInputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.tel_number.value}
              label="Telefon Numarası"
              placeholder="(5XX) XXX XX XX"
            />
            {input.tel_number.isBlur && !isTelValid && (
              <p className={classes.error}>
                Geçerli bir telefon numarası girin. (10 Haneli)
              </p>
            )}
          </div>
        </div>

        <div className={classes.inputColumn}>
          <Input
            className={classes.input}
            type="text"
            identifier="address"
            name="address"
            onChange={inputChangeHandler}
            onBlur={inputBlurHandler}
            value={input.address.value}
            label="Adres"
          />
          {input.address.isBlur && !isAddressValid && (
            <p className={classes.error}>Adres alanı boş bırakılamaz.</p>
          )}
        </div>

        <div className={classes.inputColumn}>
          <Input
            className={classes.input}
            type="text"
            identifier="iban"
            name="iban"
            onChange={localInputChangeHandler}
            onBlur={inputBlurHandler}
            value={input.iban.value}
            label="IBAN"
            placeholder="TR00 0000 0000 0000 0000 0000 00"
          />
          {input.iban.isBlur && !isIbanValid && (
            <p className={classes.error}>Geçerli bir IBAN girin.</p>
          )}
        </div>

        {isError && (
          <p className={classes.apiError}>
            {error?.message || "Kayıt işlemi başarısız oldu."}
          </p>
        )}

        <SecondaryButton
          type="submit"
          text={isPending ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          className={classes.button}
          disabled={isPending}
        />
      </form>
    </>
  );
}
