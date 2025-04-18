export const baseInvoice = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .invoice-container {
            width: 80%;
            margin: 50px auto;
            background-color: #fff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .invoice-header {
            text-align: center;
            margin-bottom: 50px;
        }
        .invoice-header h1 {
            margin: 0;
            font-size: 28px;
            color: #333;
        }
        .invoice-header p {
            margin: 5px 0;
            color: #777;
        }
        .invoice-details {
            margin-bottom: 30px;
        }
        .invoice-details .section {
            display: flex;
            justify-content: space-between;
        }
        .invoice-details .section div {
            width: 48%;
        }
        .invoice-details p {
            margin: 5px 0;
            color: #333;
        }
        .invoice-details p span {
            font-weight: bold;
        }
        .invoice-items table {
            width: 100%;
            border-collapse: collapse;
        }
        .invoice-items table, .invoice-items th, .invoice-items td {
            border: 1px solid #ddd;
        }
        .invoice-items th, .invoice-items td {
            padding: 10px;
            text-align: left;
        }
        .invoice-items th {
            background-color: #f4f4f4;
            color: #333;
        }
        .invoice-summary {
            margin-top: 30px;
            text-align: right;
        }
        .invoice-summary p {
            margin: 5px 0;
            font-size: 16px;
            color: #333;
        }
        .invoice-summary p span {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <h1>DEBIT NOTE</h1>
            <p>Invoice# INV-001</p>
            <p>Transaction ID: 123498</p>
        </div>
        <div class="invoice-details">
            <div class="section">
                <div>
                    <p><span>Bill To:</span></p>
                    <p>Joel Mbengui</p>
                    <p>Casa 11, Rua da Paz</p>
                    <p>Kilamba Kiaxi, Luanda</p>
                </div>
                <div>
                    <p><span>Invoice Date:</span> 12/12/2021</p>
                </div>
            </div>
        </div>
        <div class="invoice-items">
            <table>
                <thead>
                    <tr>
                        <th>QTY.</th>
                        <th>DESCRIPTION</th>
                        <th>UNIT PRICE</th>
                        <th>PRICE</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Add money</td>
                        <td>10.000 Kz</td>
                        <td>10.000 Kz</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="invoice-summary">
            <p><span>Subtotal:</span> 10.000 Kz</p>
            <p><span>Tax:</span> 0 Kz</p>
            <p><span>Total:</span> 10.000 Kz</p>
        </div>
    </div>
</body>
</html>

`;