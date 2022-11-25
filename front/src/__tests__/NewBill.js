/**
 * @jest-environment jsdom
 */
import { fireEvent, getByTestId } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import storeMock from "../__mocks__/store.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

describe("Given I am connected as an employee", () => {
  const onNavigate = jest.fn((pathName) => (document.body.innerHTML = ROUTES({ pathName })))

  const localStorage = window.localStorage
  const user = { email: "employee@test.tld" }

  localStorage.setItem("user", JSON.stringify(user))

  describe("When I am on NewBill Page", () => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const newBill = new NewBill({ document, onNavigate, store: storeMock, localStorage })

    describe("When I choose an image to upload", () => {
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      describe("And that the image I'm uploading isn't the right format", () => {
        test("Then, no image should be upload", () => {
          const fileInput = getByTestId(document, "file")
          const fileToUpload = new File(["billed.pdf"], "billed.pdf", { type: "application/pdf" })

          fileInput.addEventListener("change", handleChangeFile)

          userEvent.upload(fileInput, fileToUpload)

          expect(handleChangeFile).toBeCalled()
          expect(fileInput.value).toBe("")
        })
      })

      describe("And that the image I'm uploading is in the right format", () => {
        test("Then, the file input should get the file informations", () => {
          const fileInput = getByTestId(document, "file")
          const fileToUpload = new File(["image.png"], "image.png", { type: "image/png" })

          fileInput.addEventListener("change", handleChangeFile)

          userEvent.upload(fileInput, fileToUpload)

          expect(handleChangeFile).toBeCalled()
          expect(fileInput.files[0].name).toBe("image.png")
          expect(fileInput.files[0].type).toBe("image/png")
        })
      })
    })

    describe("When I complete the form and submit it", () => {
      test("Then, a new bill is created", () => {
        const handleSubmit = jest.fn(() => newBill.handleSubmit)

        const newBillForm = getByTestId(document, "form-new-bill")
        const newBillFormSubmitBtn = newBillForm.querySelector("button[type='submit']")

        newBillForm.addEventListener("submit", handleSubmit)

        const typeInput = getByTestId(document, "expense-type")
        fireEvent.change(typeInput, { target: { value: "Transports" } })

        const nameInput = getByTestId(document, "expense-name")
        fireEvent.change(nameInput, { target: { value: "Vol Paris Tokyo" } })

        const dateInput = getByTestId(document, "datepicker")
        fireEvent.change(dateInput, { target: { value: "28-03-2022" } })

        const amountInput = getByTestId(document, "amount")
        fireEvent.change(amountInput, { target: { value: "1800" } })

        const vatInput = getByTestId(document, "vat")
        fireEvent.change(vatInput, { target: { value: "70" } })

        const pctInput = getByTestId(document, "pct")
        fireEvent.change(pctInput, { target: { value: "20" } })

        const commentInput = getByTestId(document, "commentary")
        fireEvent.change(commentInput, { target: { value: "Vol pour la conférence de presse" } })

        const fileInput = getByTestId(document, "file")
        const fileToUpload = new File(["image.png"], "image.png", { type: "image/png" })
        userEvent.upload(fileInput, fileToUpload)

        userEvent.click(newBillFormSubmitBtn)

        expect(handleSubmit).toBeCalled()
        expect(onNavigate).toBeCalledWith(ROUTES_PATH["Bills"])
      })
    })
  })
})
