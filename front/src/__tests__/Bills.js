/**
 * @jest-environment jsdom
 */

import { getAllByTestId, getByTestId, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills as billsFixtures } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"

describe("Given I am connected as an employee", () => {
  const onNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }))

  const localStorage = window.localStorage
  const user = { email: "employee@test.tld" }

  localStorage.setItem("user", JSON.stringify(user))

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("icon-window"))
      const windowIcon = screen.getByTestId("icon-window")

      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: billsFixtures })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on Bills Page", () => {
    const html = BillsUI({ data: [], loading: true })
    document.body.innerHTML = html

    test("Then, the list of bills should be displayed", async () => {
      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage })
      const billsList = await bills.getBills()

      const html = BillsUI({ data: billsList })
      document.body.innerHTML = html
    })
  })

  describe("When I am on Bills Page with the list of bills loaded", () => {
    const html = BillsUI({ data: billsFixtures })
    document.body.innerHTML = html

    const bills = new Bills({ document, onNavigate, store: mockStore, localStorage })

    describe("And I click on the eye icon of one of the bills", () => {
      test("Then, the proof of the selected bill should be displayed", () => {
        const handleClickIconEye = jest.fn((icon) => bills.handleClickIconEye(icon))

        const iconEyeBtns = getAllByTestId(document, "icon-eye")
        $.fn.modal = jest.fn()

        iconEyeBtns.forEach((iconEyeBtn) => {
          iconEyeBtn.addEventListener("click", () => handleClickIconEye(iconEyeBtn))
        })

        userEvent.click(iconEyeBtns[0])

        const modalFile = document.getElementById("modaleFile")

        expect(handleClickIconEye).toBeCalled()
        expect(modalFile).toBeTruthy()
      })
    })
  })
})
