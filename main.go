package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"time"
)

type Expense struct {
	ID          int       `json:"id"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	Date        time.Time `json:"date"`
}

const dataFile = "expenses.json"

func main() {
	// Define commands and flags
	addCmd := flag.NewFlagSet("add", flag.ExitOnError)
	addDescription := addCmd.String("description", "", "Description of the expense")
	addAmount := addCmd.Float64("amount", 0, "Amount of the expense")

	listCmd := flag.NewFlagSet("list", flag.ExitOnError)

	deleteCmd := flag.NewFlagSet("delete", flag.ExitOnError)
	deleteID := deleteCmd.Int("id", 0, "ID of the expense to delete")

	summaryCmd := flag.NewFlagSet("summary", flag.ExitOnError)
	summaryMonth := summaryCmd.Int("month", 0, "Month to filter expenses for")

	// Check the subcommands
	if len(os.Args) < 2 {
		fmt.Println("Usage: expense-tracker <command> [options]")
		fmt.Println("Commands: add, list, delete, summary")
		return
	}

	switch os.Args[1] {
	case "add":
		addCmd.Parse(os.Args[2:])
		if *addDescription == "" || *addAmount <= 0 {
			fmt.Println("Description and amount are required.")
			return
		}
		addExpense(*addDescription, *addAmount)
	case "list":
		listCmd.Parse(os.Args[2:])
		listExpenses()
	case "delete":
		deleteCmd.Parse(os.Args[2:])
		if *deleteID == 0 {
			fmt.Println("ID is required for deletion.")
			return
		}
		deleteExpense(*deleteID)
	case "summary":
		summaryCmd.Parse(os.Args[2:])
		if *summaryMonth > 0 {
			monthSummary(*summaryMonth)
		} else {
			totalSummary()
		}
	default:
		fmt.Println("Unknown command")
		fmt.Println("Commands: add, list, delete, summary")
	}
}

func readExpenses() ([]Expense, error) {
	data, err := os.ReadFile(dataFile)
	if err != nil {
		if os.IsNotExist(err) {
			return []Expense{}, nil
		}
		return nil, err
	}

	var expenses []Expense
	err = json.Unmarshal(data, &expenses)
	return expenses, err
}

func writeExpenses(expenses []Expense) error {
	data, err := json.MarshalIndent(expenses, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(dataFile, data, 0644)
}

func addExpense(description string, amount float64) {
	expenses, err := readExpenses()
	if err != nil {
		fmt.Println("Error reading expenses:", err)
		return
	}

	id := 1
	if len(expenses) > 0 {
		id = expenses[len(expenses)-1].ID + 1
	}

	newExpense := Expense{
		ID:          id,
		Description: description,
		Amount:      amount,
		Date:        time.Now(),
	}

	expenses = append(expenses, newExpense)

	err = writeExpenses(expenses)
	if err != nil {
		fmt.Println("Error writing expenses:", err)
		return
	}

	fmt.Printf("Expense added successfully (ID: %d)\n", id)
}

func listExpenses() {
	expenses, err := readExpenses()
	if err != nil {
		fmt.Println("Error reading expenses:", err)
		return
	}

	fmt.Println("ID  Date       Description      Amount")
	for _, expense := range expenses {
		fmt.Printf("%-3d %-10s %-15s $%.2f\n", expense.ID, expense.Date.Format("2006-01-02"), expense.Description, expense.Amount)
	}
}

func deleteExpense(id int) {
	expenses, err := readExpenses()
	if err != nil {
		fmt.Println("Error reading expenses:", err)
		return
	}

	newExpenses := []Expense{}
	found := false
	for _, expense := range expenses {
		if expense.ID == id {
			found = true
			continue
		}
		newExpenses = append(newExpenses, expense)
	}

	if !found {
		fmt.Printf("Expense with ID %d not found.\n", id)
		return
	}

	err = writeExpenses(newExpenses)
	if err != nil {
		fmt.Println("Error writing expenses:", err)
		return
	}

	fmt.Printf("Expense deleted successfully (ID: %d)\n", id)
}

func totalSummary() {
	expenses, err := readExpenses()
	if err != nil {
		fmt.Println("Error reading expenses:", err)
		return
	}

	total := 0.0
	for _, expense := range expenses {
		total += expense.Amount
	}

	fmt.Printf("Total expenses: $%.2f\n", total)
}

func monthSummary(month int) {
	expenses, err := readExpenses()
	if err != nil {
		fmt.Println("Error reading expenses:", err)
		return
	}

	total := 0.0
	for _, expense := range expenses {
		if expense.Date.Month() == time.Month(month) && expense.Date.Year() == time.Now().Year() {
			total += expense.Amount
		}
	}

	fmt.Printf("Total expenses for %s: $%.2f\n", time.Month(month), total)
}
