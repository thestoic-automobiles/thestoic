import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Plus,
    Trash2,
    Search,
    FileText,
    User,
    ShoppingBag,
    Save,
    X,
    Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   COMPANY DETAILS
========================================================= */

const COMPANY_NAME = "THE STOIC AUTOMOBILES";

const COMPANY_ADDRESS =
    "SHOP NO 1, PRIME CENTER, NASHIK-PUNE ROAD, OPP GMD CLG, SINNAR 422103";

const COMPANY_PHONE =
    "7387480081 / 9850265981";

const COMPANY_EMAIL =
    "supportthestoic@gmail.com";

const COMPANY_GSTIN =
    "27EWVPR0539G1ZW";

const COMPANY_STATE_CODE =
    "MH-27";

const BANK_NAME =
    "INDUSIND BANK SINNAR";

const BANK_ACCOUNT =
    "252512122512";

const BANK_IFSC =
    "INDB0001605";

/*
 * Put these files inside:
 *
 * public/company-logo.png
 * public/phonepe_qr.png
 */

const COMPANY_LOGO =
    "/favicon.png";

const PHONEPE_QR =
    "/phonepe_qr.png";

/* =========================================================
   TYPES
========================================================= */

type Product = {
    id: string;
    sku: string;
    name: string;
    manufacturer: string | null;
    mrp_inr: number | null;
    price_inr: number;
    discount_pct: number | null;
    stock: number;
};

type BillItem = {
    id: string;
    product_id: string | null;

    sku: string;
    name: string;
    manufacturer: string;

    quantity: number;

    mrp: number;
    discount_pct: number;
    price: number;

    gst_pct: number;

    is_custom?: boolean;
};

type Customer = {
    name: string;
    address: string;
    gstin: string;
    phone: string;
};

/* =========================================================
   CURRENCY
========================================================= */

const formatCurrency = (
    value: number
): string => {
    return `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};

/* =========================================================
   INDIAN NUMBER TO WORDS
========================================================= */

const numberToWordsIndian = (
    num: number
): string => {
    if (!Number.isFinite(num)) {
        return "";
    }

    num =
        Math.round(num * 100) / 100;

    const rupees = Math.floor(num);

    const paise = Math.round(
        (num - rupees) * 100
    );

    const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];

    const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
    ];

    const twoDigitWords = (
        n: number
    ): string => {
        if (n < 20) {
            return ones[n];
        }

        const ten = Math.floor(n / 10);
        const one = n % 10;

        return `${tens[ten]}${one ? ` ${ones[one]}` : ""
            }`;
    };

    const convert = (
        n: number
    ): string => {
        if (n === 0) {
            return "";
        }

        const parts: string[] = [];

        if (n >= 10000000) {
            parts.push(
                `${convert(
                    Math.floor(n / 10000000)
                )} Crore`
            );

            n %= 10000000;
        }

        if (n >= 100000) {
            parts.push(
                `${convert(
                    Math.floor(n / 100000)
                )} Lakh`
            );

            n %= 100000;
        }

        if (n >= 1000) {
            parts.push(
                `${convert(
                    Math.floor(n / 1000)
                )} Thousand`
            );

            n %= 1000;
        }

        if (n >= 100) {
            parts.push(
                `${ones[Math.floor(n / 100)]
                } Hundred`
            );

            n %= 100;
        }

        if (n > 0) {
            parts.push(
                twoDigitWords(n)
            );
        }

        return parts.join(" ");
    };

    let result = `Rupees ${convert(rupees) || "Zero"
        }`;

    if (paise > 0) {
        result += ` and ${convert(
            paise
        )} Paise`;
    }

    return `${result} Only`;
};

/* =========================================================
   LOAD IMAGE FOR PDF
========================================================= */

const loadImageAsDataUrl = (
    src: string
): Promise<string> => {
    return new Promise(
        (resolve, reject) => {
            const img =
                new Image();

            img.crossOrigin =
                "anonymous";

            img.onload = () => {
                const canvas =
                    document.createElement(
                        "canvas"
                    );

                canvas.width =
                    img.naturalWidth;

                canvas.height =
                    img.naturalHeight;

                const ctx =
                    canvas.getContext(
                        "2d"
                    );

                if (!ctx) {
                    reject(
                        new Error(
                            "Unable to create canvas context"
                        )
                    );

                    return;
                }

                ctx.drawImage(
                    img,
                    0,
                    0
                );

                resolve(
                    canvas.toDataURL(
                        "image/png"
                    )
                );
            };

            img.onerror = () => {
                reject(
                    new Error(
                        `Unable to load image: ${src}`
                    )
                );
            };

            img.src = src;
        }
    );
};

/* =========================================================
   PDF GENERATOR
========================================================= */

const generateBillPDF = async ({
    invoiceNo,
    invoiceDate,
    orderDate,
    lrNo,
    cases,
    transport,
    challan,
    dispatchDate,
    customer,
    remarks,
    items,
    calculations,
}: {
    invoiceNo: string;
    invoiceDate: string;
    orderDate: string;
    lrNo: string;
    cases: string;
    transport: string;
    challan: string;
    dispatchDate: string;
    customer: Customer;
    remarks: string;
    items: BillItem[];
    calculations: {
        subtotal: number;
        discount: number;
        taxable: number;
        gst: number;
        grandTotal: number;
    };
}) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();

    const margin = 10;

    const contentWidth =
        pageWidth - margin * 2;

    /* =====================================================
       LOAD IMAGES
    ===================================================== */

    let logoData: string | null = null;
    let qrData: string | null = null;

    try {
        logoData =
            await loadImageAsDataUrl(
                COMPANY_LOGO
            );
    } catch (error) {
        console.warn(
            "Logo could not be loaded",
            error
        );
    }

    try {
        qrData =
            await loadImageAsDataUrl(
                PHONEPE_QR
            );
    } catch (error) {
        console.warn(
            "QR could not be loaded",
            error
        );
    }

    /* =====================================================
       COLORS
    ===================================================== */

    const COLORS = {
        black: [25, 25, 25] as [
            number,
            number,
            number
        ],

        dark: [45, 45, 45] as [
            number,
            number,
            number
        ],

        gray: [105, 105, 105] as [
            number,
            number,
            number
        ],

        light: [245, 245, 245] as [
            number,
            number,
            number
        ],

        border: [190, 190, 190] as [
            number,
            number,
            number
        ],

        white: [255, 255, 255] as [
            number,
            number,
            number
        ],
    };

    /* =====================================================
       HELPER
    ===================================================== */

    const money = (value: number) => {
        return `Rs. ${Number(
            value || 0
        ).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const drawSectionTitle = (
        title: string,
        x: number,
        y: number,
        width: number
    ) => {
        doc.setFillColor(
            ...COLORS.light
        );

        doc.rect(
            x,
            y,
            width,
            7,
            "F"
        );

        doc.setDrawColor(
            ...COLORS.border
        );

        doc.rect(
            x,
            y,
            width,
            7
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(8);

        doc.setTextColor(
            ...COLORS.dark
        );

        doc.text(
            title,
            x + 3,
            y + 4.7
        );
    };

    /* =====================================================
       HEADER
    ===================================================== */

    let y = 10;

    /*
     * Logo
     */

    if (logoData) {
        try {
            doc.addImage(
                logoData,
                "PNG",
                margin,
                y + 1,
                29,
                20
            );
        } catch {
            // Continue without logo
        }
    }

    /*
     * Company name
     */

    doc.setTextColor(
        ...COLORS.black
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(18);

    doc.text(
        COMPANY_NAME,
        pageWidth / 2,
        y + 7,
        {
            align: "center",
        }
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
        ...COLORS.gray
    );

    doc.text(
        COMPANY_ADDRESS,
        pageWidth / 2,
        y + 13,
        {
            align: "center",
        }
    );

    doc.text(
        `TEL: ${COMPANY_PHONE}   |   EMAIL: ${COMPANY_EMAIL}`,
        pageWidth / 2,
        y + 18,
        {
            align: "center",
        }
    );

    y += 24;

    /* =====================================================
       GST BAR
    ===================================================== */

    doc.setFillColor(
        ...COLORS.light
    );

    doc.setDrawColor(
        ...COLORS.border
    );

    doc.rect(
        margin,
        y,
        contentWidth,
        8,
        "FD"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        ...COLORS.black
    );

    doc.text(
        `GSTIN: ${COMPANY_GSTIN}    |    STATE CODE: ${COMPANY_STATE_CODE}`,
        pageWidth / 2,
        y + 5.2,
        {
            align: "center",
        }
    );

    y += 11;

    /* =====================================================
       TAX INVOICE TITLE
    ===================================================== */

    doc.setDrawColor(
        ...COLORS.black
    );

    doc.setLineWidth(0.4);

    doc.rect(
        margin,
        y,
        contentWidth,
        10
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(13);

    doc.text(
        "TAX INVOICE",
        pageWidth / 2,
        y + 6.5,
        {
            align: "center",
        }
    );

    y += 14;

    /* =====================================================
       CUSTOMER + INVOICE DETAILS
    ===================================================== */

    const customerWidth = 104;

    const invoiceWidth =
        contentWidth -
        customerWidth;

    const boxHeight = 47;

    doc.setDrawColor(
        ...COLORS.border
    );

    doc.setLineWidth(0.25);

    doc.rect(
        margin,
        y,
        contentWidth,
        boxHeight
    );

    doc.line(
        margin + customerWidth,
        y,
        margin + customerWidth,
        y + boxHeight
    );

    /*
     * Customer section
     */

    drawSectionTitle(
        "BILL TO",
        margin,
        y,
        customerWidth
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        ...COLORS.black
    );

    doc.text(
        customer.name ||
        "Customer",
        margin + 4,
        y + 14
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7.5);

    const addressLines =
        doc.splitTextToSize(
            customer.address ||
            "-",
            customerWidth - 8
        );

    doc.text(
        addressLines,
        margin + 4,
        y + 20
    );

    let customerY =
        y +
        20 +
        addressLines.length * 4;

    if (customer.phone) {
        doc.text(
            `Tel: ${customer.phone}`,
            margin + 4,
            customerY + 2
        );

        customerY += 5;
    }

    if (customer.gstin) {
        doc.text(
            `GSTIN: ${customer.gstin}`,
            margin + 4,
            customerY + 2
        );
    }

    /*
     * Invoice section
     */

    const invoiceX =
        margin + customerWidth;

    drawSectionTitle(
        "INVOICE DETAILS",
        invoiceX,
        y,
        invoiceWidth
    );

    const invoiceRows = [
        [
            "Invoice No.",
            invoiceNo || "-",
        ],
        [
            "Invoice Date",
            invoiceDate || "-",
        ],
        [
            "Order Date",
            orderDate || "-",
        ],
        [
            "LR / RR No.",
            lrNo || "-",
        ],
        [
            "Cases",
            cases || "-",
        ],
        [
            "Transport",
            transport || "-",
        ],
    ];

    let invoiceY =
        y + 14;

    invoiceRows.forEach(
        ([label, value]) => {
            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(7.5);

            doc.text(
                label,
                invoiceX + 4,
                invoiceY
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.text(
                value,
                invoiceX + 38,
                invoiceY
            );

            invoiceY += 5.8;
        }
    );

    y += boxHeight + 6;

    /* =====================================================
       PRODUCT TABLE
       
       IMPORTANT:
       Total width = 190mm exactly.
    ===================================================== */

    const tableRows =
        items.map(
            (item, index) => {
                const amount =
                    Number(
                        item.quantity
                    ) *
                    Number(
                        item.price
                    );

                return [
                    String(index + 1),

                    item.sku,

                    `${item.name}${item.is_custom
                        ? " (Custom)"
                        : ""
                    }`,

                    item.manufacturer ||
                    "-",

                    String(
                        item.quantity
                    ),

                    money(item.mrp),

                    `${Number(
                        item.discount_pct
                    ).toFixed(1)}%`,

                    money(item.price),

                    `${Number(
                        item.gst_pct
                    ).toFixed(1)}%`,

                    money(amount),
                ];
            }
        );

    autoTable(
        doc,
        {
            startY: y,

            margin: {
                left: margin,
                right: margin,
            },

            tableWidth:
                contentWidth,

            head: [
                [
                    "Sr.",
                    "Product ID",
                    "Product Name",
                    "Make",
                    "Qty",
                    "MRP",
                    "Disc.",
                    "Price",
                    "GST",
                    "Amount",
                ],
            ],

            body: tableRows,

            theme: "grid",

            styles: {
                font:
                    "helvetica",

                fontSize: 7,

                textColor:
                    COLORS.black,

                lineColor:
                    COLORS.border,

                lineWidth: 0.2,

                cellPadding: 2.2,

                valign: "middle",

                overflow:
                    "linebreak",
            },

            headStyles: {
                fillColor:
                    COLORS.dark,

                textColor:
                    COLORS.white,

                fontStyle:
                    "bold",

                fontSize: 7,

                halign:
                    "center",

                valign:
                    "middle",

                cellPadding: 2.5,
            },

            bodyStyles: {
                minCellHeight: 8,
            },

            alternateRowStyles: {
                fillColor: [
                    249,
                    249,
                    249,
                ],
            },

            columnStyles: {
                /*
                 * TOTAL = 190mm
                 *
                 * 7 + 20 + 39 + 20 + 10 +
                 * 18 + 14 + 18 + 14 + 30
                 * = 190
                 */

                0: {
                    cellWidth: 7,
                    halign:
                        "center",
                },

                1: {
                    cellWidth: 20,
                },

                2: {
                    cellWidth: 39,
                },

                3: {
                    cellWidth: 20,
                },

                4: {
                    cellWidth: 10,
                    halign:
                        "center",
                },

                5: {
                    cellWidth: 18,
                    halign:
                        "right",
                },

                6: {
                    cellWidth: 14,
                    halign:
                        "center",
                },

                7: {
                    cellWidth: 18,
                    halign:
                        "right",
                },

                8: {
                    cellWidth: 14,
                    halign:
                        "center",
                },

                9: {
                    cellWidth: 30,
                    halign:
                        "right",
                },
            },

            didParseCell: (
                data
            ) => {
                if (
                    data.section ===
                    "body"
                ) {
                    if (
                        data.column.index ===
                        0
                    ) {
                        data.cell.styles.halign =
                            "center";
                    }
                }
            },
        }
    );

    y =
        ((doc as any)
            .lastAutoTable
            ?.finalY || y + 20) +
        6;

    /* =====================================================
       SUMMARY
    ===================================================== */

    const wordsWidth = 105;

    const summaryWidth =
        contentWidth -
        wordsWidth -
        5;

    const summaryX =
        margin +
        wordsWidth +
        5;

    const summaryHeight = 42;

    /*
     * Amount in words
     */

    doc.setDrawColor(
        ...COLORS.border
    );

    doc.rect(
        margin,
        y,
        wordsWidth,
        summaryHeight
    );

    drawSectionTitle(
        "AMOUNT IN WORDS",
        margin,
        y,
        wordsWidth
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    const amountWords =
        numberToWordsIndian(
            calculations.grandTotal
        );

    const wordsLines =
        doc.splitTextToSize(
            amountWords,
            wordsWidth - 8
        );

    doc.text(
        wordsLines,
        margin + 4,
        y + 14
    );

    /*
     * Summary
     */

    doc.rect(
        summaryX,
        y,
        summaryWidth,
        summaryHeight
    );

    drawSectionTitle(
        "BILL SUMMARY",
        summaryX,
        y,
        summaryWidth
    );

    let summaryY =
        y + 14;

    const summaryRow = (
        label: string,
        value: string,
        bold = false
    ) => {
        doc.setFont(
            "helvetica",
            bold
                ? "bold"
                : "normal"
        );

        doc.setFontSize(
            bold ? 8.5 : 7.5
        );

        doc.text(
            label,
            summaryX + 4,
            summaryY
        );

        doc.text(
            value,
            summaryX +
            summaryWidth -
            4,
            summaryY,
            {
                align: "right",
            }
        );

        summaryY +=
            bold ? 7 : 5.5;
    };

    summaryRow(
        "Subtotal",
        money(
            calculations.subtotal
        )
    );

    summaryRow(
        "Discount",
        `- ${money(
            calculations.discount
        )}`
    );

    summaryRow(
        "Taxable Amount",
        money(
            calculations.taxable
        )
    );

    summaryRow(
        "GST",
        money(
            calculations.gst
        )
    );

    doc.setDrawColor(
        ...COLORS.border
    );

    doc.line(
        summaryX + 4,
        summaryY - 3.5,
        summaryX +
        summaryWidth -
        4,
        summaryY - 3.5
    );

    summaryRow(
        "GRAND TOTAL",
        money(
            calculations.grandTotal
        ),
        true
    );

    y += summaryHeight + 6;

    /* =====================================================
       REMARKS
    ===================================================== */

    if (remarks.trim()) {
        drawSectionTitle(
            "REMARKS / NOTES",
            margin,
            y,
            contentWidth
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(7.5);

        const remarkLines =
            doc.splitTextToSize(
                remarks,
                contentWidth - 8
            );

        doc.text(
            remarkLines,
            margin + 4,
            y + 13
        );

        y +=
            18 +
            remarkLines.length *
            3.5;
    }

    /* =====================================================
       FOOTER PAYMENT SECTION
    ===================================================== */

    /*
     * Keep footer compact.
     */

    const footerHeight = 58;

    if (
        y + footerHeight >
        pageHeight - 14
    ) {
        doc.addPage();

        y = 12;
    }

    const bankWidth = 66;

    const qrWidth = 58;

    const signatureWidth =
        contentWidth -
        bankWidth -
        qrWidth;

    /*
     * Outer footer
     */

    doc.setDrawColor(
        ...COLORS.border
    );

    doc.rect(
        margin,
        y,
        contentWidth,
        footerHeight
    );

    /*
     * Dividers
     */

    const qrX =
        margin + bankWidth;

    const signatureX =
        qrX + qrWidth;

    doc.line(
        qrX,
        y,
        qrX,
        y + footerHeight
    );

    doc.line(
        signatureX,
        y,
        signatureX,
        y + footerHeight
    );

    /* =====================================================
       BANK
    ===================================================== */

    drawSectionTitle(
        "BANK DETAILS",
        margin,
        y,
        bankWidth
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(7);

    doc.text(
        `Bank: ${BANK_NAME}`,
        margin + 4,
        y + 14
    );

    doc.text(
        `A/C No.: ${BANK_ACCOUNT}`,
        margin + 4,
        y + 21
    );

    doc.text(
        `IFSC: ${BANK_IFSC}`,
        margin + 4,
        y + 28
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Payment Mode",
        margin + 4,
        y + 38
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        "UPI / Bank Transfer / Cash",
        margin + 4,
        y + 45
    );

    /* =====================================================
       QR
    ===================================================== */

    drawSectionTitle(
        "SCAN TO PAY",
        qrX,
        y,
        qrWidth
    );

    if (qrData) {
        try {
            const qrSize = 35;

            doc.addImage(
                qrData,
                "PNG",
                qrX +
                (qrWidth -
                    qrSize) /
                2,
                y + 10,
                qrSize,
                qrSize
            );
        } catch {
            // Ignore
        }
    }

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(6.5);

    doc.text(
        "Scan & Pay Using PhonePe App",
        qrX +
        qrWidth / 2,
        y + 51,
        {
            align: "center",
        }
    );

    /* =====================================================
       SIGNATURE
    ===================================================== */

    drawSectionTitle(
        "AUTHORIZATION",
        signatureX,
        y,
        signatureWidth
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(6.5);

    doc.setTextColor(
        ...COLORS.gray
    );

    doc.text(
        "Goods once sold will not be taken back.",
        signatureX +
        signatureWidth / 2,
        y + 14,
        {
            align: "center",
        }
    );

    doc.setTextColor(
        ...COLORS.black
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(8);

    doc.text(
        `For ${COMPANY_NAME}`,
        signatureX +
        signatureWidth / 2,
        y + 22,
        {
            align: "center",
        }
    );

    /*
     * Signature line
     */

    const lineWidth =
        signatureWidth - 16;

    const lineX =
        signatureX +
        8;

    const lineY =
        y + 43;

    doc.setDrawColor(
        90,
        90,
        90
    );

    doc.line(
        lineX,
        lineY,
        lineX + lineWidth,
        lineY
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(6.5);

    doc.text(
        "Authorised Signatory",
        signatureX +
        signatureWidth / 2,
        y + 50,
        {
            align: "center",
        }
    );

    /* =====================================================
       FOOTER
    ===================================================== */

    const pageCount =
        doc.getNumberOfPages();

    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {
        doc.setPage(page);

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(6.5);

        doc.setTextColor(
            125,
            125,
            125
        );

        doc.text(
            "This is a computer generated invoice",
            margin,
            pageHeight - 6
        );

        doc.text(
            `Page ${page} of ${pageCount}`,
            pageWidth -
            margin,
            pageHeight - 6,
            {
                align: "right",
            }
        );
    }

    /* =====================================================
       DOWNLOAD
    ===================================================== */

    const safeInvoiceNo =
        invoiceNo
            .trim()
            .replace(
                /[^a-zA-Z0-9-_]/g,
                "-"
            );

    doc.save(
        `Invoice-${safeInvoiceNo || "Bill"}.pdf`
    );
};

/* =========================================================
   COMPONENT
========================================================= */

const BillManager = () => {
    /* =======================================================
       PRODUCTS
    ======================================================= */

    const [products, setProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    /* =======================================================
       PRODUCT SEARCH
    ======================================================= */

    const [productSearch, setProductSearch] =
        useState("");

    const [
        showProductSearch,
        setShowProductSearch,
    ] = useState(false);

    /* =======================================================
       CUSTOM PRODUCT
    ======================================================= */

    const [
        showCustomProduct,
        setShowCustomProduct,
    ] = useState(false);

    const [
        customProduct,
        setCustomProduct,
    ] = useState({
        sku: "",
        name: "",
        manufacturer: "",
        quantity: 1,
        mrp: 0,
        discount_pct: 0,
        price: 0,
        gst_pct: 18,
    });

    /* =======================================================
       INVOICE DETAILS
    ======================================================= */

    const [invoiceNo, setInvoiceNo] =
        useState("");

    const [
        invoiceDate,
        setInvoiceDate,
    ] = useState(
        new Date()
            .toISOString()
            .slice(0, 10)
    );

    const [orderDate, setOrderDate] =
        useState(
            new Date()
                .toISOString()
                .slice(0, 10)
        );

    const [lrNo, setLrNo] =
        useState("");

    const [cases, setCases] =
        useState("");

    const [transport, setTransport] =
        useState("");

    const [challan, setChallan] =
        useState("");

    const [
        dispatchDate,
        setDispatchDate,
    ] = useState("");

    /* =======================================================
       CUSTOMER
    ======================================================= */

    const [customer, setCustomer] =
        useState<Customer>({
            name: "",
            address: "",
            gstin: "",
            phone: "",
        });

    /* =======================================================
       REMARKS
    ======================================================= */

    const [remarks, setRemarks] =
        useState("");

    /* =======================================================
       BILL ITEMS
    ======================================================= */

    const [items, setItems] =
        useState<BillItem[]>([]);

    /* =======================================================
       LOAD PRODUCTS
    ======================================================= */

    useEffect(() => {
        const loadProducts =
            async () => {
                setLoading(true);

                const { data, error } =
                    await supabase
                        .from("products")
                        .select(
                            `
                id,
                sku,
                name,
                manufacturer,
                mrp_inr,
                price_inr,
                discount_pct,
                stock
              `
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .order("name");

                if (error) {
                    console.error(
                        "Products loading error:",
                        error
                    );

                    toast.error(
                        error.message
                    );

                    setProducts([]);
                } else {
                    setProducts(
                        (data as Product[]) ||
                        []
                    );
                }

                setLoading(false);
            };

        loadProducts();
    }, []);

    /* =======================================================
       SEARCH PRODUCTS
    ======================================================= */

    const searchedProducts =
        useMemo(() => {
            const query =
                productSearch
                    .trim()
                    .toLowerCase();

            if (!query) {
                return products.slice(
                    0,
                    10
                );
            }

            return products
                .filter((product) => {
                    return (
                        product.name
                            .toLowerCase()
                            .includes(query) ||
                        product.sku
                            .toLowerCase()
                            .includes(query) ||
                        (
                            product.manufacturer ||
                            ""
                        )
                            .toLowerCase()
                            .includes(query)
                    );
                })
                .slice(0, 10);
        }, [
            products,
            productSearch,
        ]);

    /* =======================================================
       ADD DATABASE PRODUCT
    ======================================================= */

    const addProduct = (
        product: Product
    ) => {
        const existing =
            items.find(
                (item) =>
                    item.product_id ===
                    product.id
            );

        if (existing) {
            setItems((current) =>
                current.map((item) =>
                    item.product_id ===
                        product.id
                        ? {
                            ...item,
                            quantity:
                                item.quantity + 1,
                        }
                        : item
                )
            );

            toast.success(
                "Product quantity increased"
            );
        } else {
            const mrp =
                Number(
                    product.mrp_inr ??
                    product.price_inr
                );

            const price =
                Number(
                    product.price_inr
                );

            setItems((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),

                    product_id:
                        product.id,

                    sku: product.sku,

                    name: product.name,

                    manufacturer:
                        product.manufacturer ||
                        "",

                    quantity: 1,

                    mrp,

                    discount_pct:
                        Number(
                            product.discount_pct ||
                            0
                        ),

                    price,

                    gst_pct: 18,

                    is_custom: false,
                },
            ]);

            toast.success(
                "Product added to bill"
            );
        }

        setProductSearch("");

        setShowProductSearch(
            false
        );
    };

    /* =======================================================
       ADD CUSTOM PRODUCT
    ======================================================= */

    const addCustomProduct =
        () => {
            if (
                !customProduct.sku.trim()
            ) {
                toast.error(
                    "Product ID / Part No. is required"
                );

                return;
            }

            if (
                !customProduct.name.trim()
            ) {
                toast.error(
                    "Product name is required"
                );

                return;
            }

            if (
                customProduct.quantity <=
                0
            ) {
                toast.error(
                    "Quantity must be greater than 0"
                );

                return;
            }

            if (
                customProduct.price < 0
            ) {
                toast.error(
                    "Price cannot be negative"
                );

                return;
            }

            const newItem: BillItem = {
                id: crypto.randomUUID(),

                product_id: null,

                sku:
                    customProduct.sku.trim(),

                name:
                    customProduct.name.trim(),

                manufacturer:
                    customProduct.manufacturer.trim(),

                quantity:
                    Number(
                        customProduct.quantity
                    ),

                mrp:
                    Number(
                        customProduct.mrp
                    ),

                discount_pct:
                    Number(
                        customProduct.discount_pct
                    ),

                price:
                    Number(
                        customProduct.price
                    ),

                gst_pct:
                    Number(
                        customProduct.gst_pct
                    ),

                is_custom: true,
            };

            setItems((current) => [
                ...current,
                newItem,
            ]);

            setCustomProduct({
                sku: "",
                name: "",
                manufacturer: "",
                quantity: 1,
                mrp: 0,
                discount_pct: 0,
                price: 0,
                gst_pct: 18,
            });

            setShowCustomProduct(
                false
            );

            toast.success(
                "Custom product added to bill"
            );
        };

    /* =======================================================
       UPDATE ITEM
    ======================================================= */

    const updateItem = (
        id: string,
        field: keyof BillItem,
        value: number | string
    ) => {
        setItems((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    };

    /* =======================================================
       REMOVE ITEM
    ======================================================= */

    const removeItem = (
        id: string
    ) => {
        setItems((current) =>
            current.filter(
                (item) =>
                    item.id !== id
            )
        );
    };

    /* =======================================================
       CALCULATIONS
    ======================================================= */

    const calculations =
        useMemo(() => {
            let subtotal = 0;

            let discount = 0;

            let taxable = 0;

            let gst = 0;

            items.forEach((item) => {
                const quantity =
                    Number(
                        item.quantity
                    ) || 0;

                const mrp =
                    Number(item.mrp) || 0;

                const price =
                    Number(item.price) || 0;

                const gstPct =
                    Number(
                        item.gst_pct
                    ) || 0;

                const lineMrp =
                    mrp * quantity;

                const linePrice =
                    price * quantity;

                const lineDiscount =
                    lineMrp -
                    linePrice;

                const lineGst =
                    linePrice *
                    (gstPct / 100);

                subtotal += lineMrp;

                discount +=
                    lineDiscount;

                taxable +=
                    linePrice;

                gst += lineGst;
            });

            const grandTotal =
                taxable + gst;

            return {
                subtotal,
                discount,
                taxable,
                gst,
                grandTotal,
            };
        }, [items]);

    /* =======================================================
       SAVE BILL + DOWNLOAD PDF
    ======================================================= */

    const saveBill = async () => {
        if (!invoiceNo.trim()) {
            toast.error(
                "Invoice number is required"
            );

            return;
        }

        if (!customer.name.trim()) {
            toast.error(
                "Customer name is required"
            );

            return;
        }

        if (items.length === 0) {
            toast.error(
                "Add at least one product"
            );

            return;
        }

        try {
            toast.loading(
                "Generating invoice PDF...",
                {
                    id: "generate-bill",
                }
            );

            await generateBillPDF({
                invoiceNo,
                invoiceDate,
                orderDate,
                lrNo,
                cases,
                transport,
                challan,
                dispatchDate,
                customer,
                remarks,
                items,
                calculations,
            });

            toast.success(
                "Invoice PDF downloaded successfully",
                {
                    id: "generate-bill",
                }
            );
        } catch (error) {
            console.error(
                "PDF generation error:",
                error
            );

            toast.error(
                "Unable to generate PDF",
                {
                    id: "generate-bill",
                }
            );
        }
    };

    /* =======================================================
       RESET BILL
    ======================================================= */

    const resetBill = () => {
        if (
            !confirm(
                "Clear the current bill?"
            )
        ) {
            return;
        }

        setInvoiceNo("");

        setInvoiceDate(
            new Date()
                .toISOString()
                .slice(0, 10)
        );

        setOrderDate(
            new Date()
                .toISOString()
                .slice(0, 10)
        );

        setLrNo("");

        setCases("");

        setTransport("");

        setChallan("");

        setDispatchDate("");

        setCustomer({
            name: "",
            address: "",
            gstin: "",
            phone: "",
        });

        setRemarks("");

        setItems([]);

        setProductSearch("");

        setShowProductSearch(
            false
        );

        setShowCustomProduct(
            false
        );
    };

    /* =======================================================
       RENDER
    ======================================================= */

    return (
        <div className="space-y-6">

            {/* ===================================================
          HEADER
      =================================================== */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>

                    <h1 className="font-display text-2xl font-bold uppercase flex items-center gap-2">
                        <FileText size={22} />
                        Generate Bill
                    </h1>

                    <p className="text-sm text-muted-foreground mt-1">
                        Create a new sales invoice
                    </p>

                </div>

                <div className="flex gap-2">

                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetBill}
                    >
                        Clear
                    </Button>

                    <Button
                        type="button"
                        onClick={saveBill}
                        disabled={
                            loading ||
                            items.length === 0
                        }
                    >
                        <Download size={16} />
                        Save & Download PDF
                    </Button>

                </div>

            </div>

            {/* ===================================================
          COMPANY HEADER
      =================================================== */}

            <div className="border rounded-lg overflow-hidden">

                <div className="p-5 text-center">

                    <div className="flex justify-center mb-3">

                        <img
                            src={COMPANY_LOGO}
                            alt="Company Logo"
                            className="h-16 w-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display =
                                    "none";
                            }}
                        />

                    </div>

                    <h2 className="font-display text-xl font-bold uppercase">
                        {COMPANY_NAME}
                    </h2>

                    <p className="text-sm mt-1">
                        Shop No 1, Prime Center
                        Nashik-Pune Road,
                        Opp GMD Clg,
                        Sinnar 422103
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        TEL: {COMPANY_PHONE}

                        <span className="mx-2">
                            •
                        </span>

                        EMAIL:
                        {COMPANY_EMAIL}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 border rounded px-3 py-1.5 text-xs font-semibold">

                        GSTIN:
                        {COMPANY_GSTIN}

                        <span>•</span>

                        STATE CODE:
                        {COMPANY_STATE_CODE}

                    </div>

                </div>

                <div className="border-t bg-secondary/30 p-3 text-center">

                    <span className="font-display font-semibold uppercase text-sm">
                        Tax Invoice
                    </span>

                </div>

            </div>

            {/* ===================================================
          INVOICE INFORMATION
      =================================================== */}

            <div className="border rounded-lg p-6 space-y-4">

                <h2 className="font-display text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} />
                    Invoice Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div>
                        <Label>
                            Invoice No. *
                        </Label>

                        <Input
                            value={invoiceNo}
                            onChange={(e) =>
                                setInvoiceNo(
                                    e.target.value
                                )
                            }
                            placeholder="2807"
                        />
                    </div>

                    <div>
                        <Label>
                            Invoice Date
                        </Label>

                        <Input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) =>
                                setInvoiceDate(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <Label>
                            Order Date
                        </Label>

                        <Input
                            type="date"
                            value={orderDate}
                            onChange={(e) =>
                                setOrderDate(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <Label>
                            Challan No.
                        </Label>

                        <Input
                            value={challan}
                            onChange={(e) =>
                                setChallan(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <Label>
                            LR / RR No.
                        </Label>

                        <Input
                            value={lrNo}
                            onChange={(e) =>
                                setLrNo(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <Label>
                            Cases
                        </Label>

                        <Input
                            value={cases}
                            onChange={(e) =>
                                setCases(
                                    e.target.value
                                )
                            }
                            placeholder="7 BOX"
                        />
                    </div>

                    <div>
                        <Label>
                            Transport
                        </Label>

                        <Input
                            value={transport}
                            onChange={(e) =>
                                setTransport(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <Label>
                            Dispatch Date
                        </Label>

                        <Input
                            type="date"
                            value={
                                dispatchDate
                            }
                            onChange={(e) =>
                                setDispatchDate(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                </div>

            </div>

            {/* ===================================================
          CUSTOMER
      =================================================== */}

            <div className="border rounded-lg p-6 space-y-4">

                <h2 className="font-display text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <User size={16} />
                    Customer Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                        <Label>
                            Customer Name *
                        </Label>

                        <Input
                            value={
                                customer.name
                            }
                            onChange={(e) =>
                                setCustomer({
                                    ...customer,
                                    name:
                                        e.target.value,
                                })
                            }
                            placeholder="Customer name"
                        />
                    </div>

                    <div>
                        <Label>
                            Telephone
                        </Label>

                        <Input
                            value={
                                customer.phone
                            }
                            onChange={(e) =>
                                setCustomer({
                                    ...customer,
                                    phone:
                                        e.target.value,
                                })
                            }
                            placeholder="Mobile / Telephone"
                        />
                    </div>

                    <div>
                        <Label>
                            GSTIN
                        </Label>

                        <Input
                            value={
                                customer.gstin
                            }
                            onChange={(e) =>
                                setCustomer({
                                    ...customer,
                                    gstin:
                                        e.target.value,
                                })
                            }
                            placeholder="Customer GSTIN"
                        />
                    </div>

                    <div className="md:col-span-2">

                        <Label>
                            Address
                        </Label>

                        <Textarea
                            rows={3}
                            value={
                                customer.address
                            }
                            onChange={(e) =>
                                setCustomer({
                                    ...customer,
                                    address:
                                        e.target.value,
                                })
                            }
                            placeholder="Customer address"
                        />

                    </div>

                </div>

            </div>

            {/* ===================================================
          PRODUCTS
      =================================================== */}

            <div className="border rounded-lg p-6 space-y-4">

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    <h2 className="font-display text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag size={16} />
                        Products
                    </h2>

                    <div className="flex flex-wrap items-center gap-2">

                        {/* DATABASE SEARCH */}

                        <div className="relative">

                            <div className="relative">

                                <Search
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                />

                                <Input
                                    value={
                                        productSearch
                                    }
                                    onChange={(e) => {
                                        setProductSearch(
                                            e.target.value
                                        );

                                        setShowProductSearch(
                                            true
                                        );
                                    }}
                                    onFocus={() =>
                                        setShowProductSearch(
                                            true
                                        )
                                    }
                                    placeholder="Search product / SKU"
                                    className="pl-9 w-[280px]"
                                />

                                {showProductSearch &&
                                    productSearch.trim() && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-1 border rounded-md bg-background shadow-lg overflow-hidden">

                                            {searchedProducts.length ===
                                                0 ? (
                                                <div className="p-3 text-sm text-muted-foreground">
                                                    No products found
                                                </div>
                                            ) : (
                                                searchedProducts.map(
                                                    (
                                                        product
                                                    ) => (
                                                        <button
                                                            key={
                                                                product.id
                                                            }
                                                            type="button"
                                                            className="w-full text-left px-3 py-3 hover:bg-secondary border-b last:border-0"
                                                            onClick={() =>
                                                                addProduct(
                                                                    product
                                                                )
                                                            }
                                                        >

                                                            <div className="font-medium text-sm">
                                                                {
                                                                    product.name
                                                                }
                                                            </div>

                                                            <div className="text-xs text-muted-foreground flex items-center justify-between mt-1">

                                                                <span className="font-mono">
                                                                    {
                                                                        product.sku
                                                                    }
                                                                </span>

                                                                <span>
                                                                    {formatCurrency(
                                                                        Number(
                                                                            product.price_inr
                                                                        )
                                                                    )}
                                                                </span>

                                                            </div>

                                                            <div className="text-[11px] text-muted-foreground mt-1">

                                                                Make:{" "}
                                                                {
                                                                    product.manufacturer ||
                                                                    "—"
                                                                }

                                                                <span className="mx-2">
                                                                    •
                                                                </span>

                                                                Stock:{" "}
                                                                {
                                                                    product.stock
                                                                }

                                                            </div>

                                                        </button>
                                                    )
                                                )
                                            )}

                                        </div>
                                    )}

                            </div>

                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowProductSearch(
                                    !showProductSearch
                                );

                                setShowCustomProduct(
                                    false
                                );
                            }}
                        >
                            <Plus size={16} />
                            Add Product
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowCustomProduct(
                                    !showCustomProduct
                                );

                                setShowProductSearch(
                                    false
                                );
                            }}
                        >
                            <Plus size={16} />
                            Custom Product
                        </Button>

                    </div>

                </div>

                {/* =================================================
            CUSTOM PRODUCT
        ================================================== */}

                {showCustomProduct && (
                    <div className="border rounded-lg p-5 bg-secondary/20 space-y-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <h3 className="font-display font-semibold uppercase text-sm">
                                    Add Custom Product
                                </h3>

                                <p className="text-xs text-muted-foreground mt-1">
                                    Manually enter a product that is not available in the database.
                                </p>

                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setShowCustomProduct(
                                        false
                                    )
                                }
                            >
                                <X size={16} />
                            </Button>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            <div>
                                <Label>
                                    Product ID / Part No. *
                                </Label>

                                <Input
                                    value={
                                        customProduct.sku
                                    }
                                    onChange={(e) =>
                                        setCustomProduct(
                                            {
                                                ...customProduct,
                                                sku:
                                                    e.target
                                                        .value,
                                            }
                                        )
                                    }
                                    placeholder="PART-001"
                                />
                            </div>

                            <div className="md:col-span-2">

                                <Label>
                                    Product Name *
                                </Label>

                                <Input
                                    value={
                                        customProduct.name
                                    }
                                    onChange={(e) =>
                                        setCustomProduct(
                                            {
                                                ...customProduct,
                                                name:
                                                    e.target
                                                        .value,
                                            }
                                        )
                                    }
                                    placeholder="Product name"
                                />

                            </div>

                            <div>

                                <Label>
                                    Make
                                </Label>

                                <Input
                                    value={
                                        customProduct.manufacturer
                                    }
                                    onChange={(e) =>
                                        setCustomProduct(
                                            {
                                                ...customProduct,
                                                manufacturer:
                                                    e.target
                                                        .value,
                                            }
                                        )
                                    }
                                    placeholder="Manufacturer / Make"
                                />

                            </div>

                            <div>

                                <Label>
                                    Quantity *
                                </Label>

                                <Input
                                    type="number"
                                    min="1"
                                    value={
                                        customProduct.quantity
                                    }
                                    onChange={(e) =>
                                        setCustomProduct(
                                            {
                                                ...customProduct,
                                                quantity:
                                                    Math.max(
                                                        1,
                                                        Number(
                                                            e.target
                                                                .value
                                                        ) || 1
                                                    ),
                                            }
                                        )
                                    }
                                />

                            </div>

                            <div>

                                <Label>
                                    MRP
                                </Label>

                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        customProduct.mrp
                                    }
                                    onChange={(e) =>
                                        setCustomProduct(
                                            {
                                                ...customProduct,
                                                mrp:
                                                    Number(
                                                        e.target
                                                            .value
                                                    ) || 0,
                                            }
                                        )
                                    }
                                />

                            </div>

                            <div>

                                <Label>
                                    Discount %
                                </Label>

                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={
                                        customProduct.discount_pct
                                    }
                                    onChange={(e) =>
                                        setCustomProduct(
                                            {
                                                ...customProduct,
                                                discount_pct:
                                                    Number(
                                                        e.target
                                                            .value
                                                    ) || 0,
                                            }
                                        )
                                    }
                                />

                            </div>

                            <div>

                                <Label>
                                    Price *
                                </Label>

                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        customProduct.price
                                    }
                                    onChange={(e) =>
                                        setCustomProduct(
                                            {
                                                ...customProduct,
                                                price:
                                                    Number(
                                                        e.target
                                                            .value
                                                    ) || 0,
                                            }
                                        )
                                    }
                                />

                            </div>

                            <div>

                                <Label>
                                    GST %
                                </Label>

                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={
                                        customProduct.gst_pct
                                    }
                                    onChange={(e) =>
                                        setCustomProduct(
                                            {
                                                ...customProduct,
                                                gst_pct:
                                                    Number(
                                                        e.target
                                                            .value
                                                    ) || 0,
                                            }
                                        )
                                    }
                                />

                            </div>

                        </div>

                        <div className="flex justify-end gap-2">

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    setShowCustomProduct(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={
                                    addCustomProduct
                                }
                            >
                                <Plus size={16} />
                                Add Custom Product
                            </Button>

                        </div>

                    </div>
                )}

                {/* =================================================
            PRODUCT TABLE
        ================================================== */}

                <div className="overflow-x-auto border rounded-lg">

                    <table className="w-full text-sm">

                        <thead className="bg-secondary">

                            <tr className="text-left">

                                <th className="p-3">
                                    Sr.
                                </th>

                                <th className="p-3">
                                    Product ID
                                </th>

                                <th className="p-3 min-w-[220px]">
                                    Product Name
                                </th>

                                <th className="p-3 min-w-[120px]">
                                    Make
                                </th>

                                <th className="p-3">
                                    Qty
                                </th>

                                <th className="p-3">
                                    MRP
                                </th>

                                <th className="p-3">
                                    Disc %
                                </th>

                                <th className="p-3">
                                    Price
                                </th>

                                <th className="p-3">
                                    GST %
                                </th>

                                <th className="p-3 text-right">
                                    Amount
                                </th>

                                <th className="p-3" />

                            </tr>

                        </thead>

                        <tbody>

                            {items.map(
                                (item, index) => {
                                    const amount =
                                        Number(
                                            item.quantity
                                        ) *
                                        Number(
                                            item.price
                                        );

                                    return (
                                        <tr
                                            key={
                                                item.id
                                            }
                                            className="border-t align-middle"
                                        >

                                            <td className="p-3 text-muted-foreground">
                                                {index + 1}
                                            </td>

                                            <td className="p-3 font-mono text-xs">

                                                <div className="flex items-center gap-2">

                                                    {item.sku}

                                                    {item.is_custom && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-signal/10 text-signal uppercase">
                                                            Custom
                                                        </span>
                                                    )}

                                                </div>

                                            </td>

                                            <td className="p-3 font-medium">
                                                {item.name}
                                            </td>

                                            <td className="p-3 text-muted-foreground">
                                                {
                                                    item.manufacturer ||
                                                    "—"
                                                }
                                            </td>

                                            <td className="p-3">

                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        item.quantity
                                                    }
                                                    onChange={(e) =>
                                                        updateItem(
                                                            item.id,
                                                            "quantity",
                                                            Math.max(
                                                                1,
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                ) || 1
                                                            )
                                                        )
                                                    }
                                                    className="h-8 w-20"
                                                />

                                            </td>

                                            <td className="p-3">

                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        item.mrp
                                                    }
                                                    onChange={(e) =>
                                                        updateItem(
                                                            item.id,
                                                            "mrp",
                                                            Number(
                                                                e.target
                                                                    .value
                                                            ) || 0
                                                        )
                                                    }
                                                    className="h-8 w-24"
                                                />

                                            </td>

                                            <td className="p-3">

                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    value={
                                                        item.discount_pct
                                                    }
                                                    onChange={(e) =>
                                                        updateItem(
                                                            item.id,
                                                            "discount_pct",
                                                            Number(
                                                                e.target
                                                                    .value
                                                            ) || 0
                                                        )
                                                    }
                                                    className="h-8 w-20"
                                                />

                                            </td>

                                            <td className="p-3">

                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        item.price
                                                    }
                                                    onChange={(e) =>
                                                        updateItem(
                                                            item.id,
                                                            "price",
                                                            Number(
                                                                e.target
                                                                    .value
                                                            ) || 0
                                                        )
                                                    }
                                                    className="h-8 w-24"
                                                />

                                            </td>

                                            <td className="p-3">

                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    value={
                                                        item.gst_pct
                                                    }
                                                    onChange={(e) =>
                                                        updateItem(
                                                            item.id,
                                                            "gst_pct",
                                                            Number(
                                                                e.target
                                                                    .value
                                                            ) || 0
                                                        )
                                                    }
                                                    className="h-8 w-20"
                                                />

                                            </td>

                                            <td className="p-3 text-right font-semibold whitespace-nowrap">
                                                {formatCurrency(
                                                    amount
                                                )}
                                            </td>

                                            <td className="p-3">

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    <Trash2
                                                        size={15}
                                                    />
                                                </Button>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                            {items.length ===
                                0 && (
                                    <tr>

                                        <td
                                            colSpan={11}
                                            className="p-10 text-center text-muted-foreground"
                                        >
                                            {loading
                                                ? "Loading products…"
                                                : "No products added. Search a product or add a custom product to start the bill."}
                                        </td>

                                    </tr>
                                )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ===================================================
          SUMMARY
      =================================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="border rounded-lg p-6">

                    <h2 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">
                        Remarks / Notes
                    </h2>

                    <Textarea
                        rows={6}
                        value={remarks}
                        onChange={(e) =>
                            setRemarks(
                                e.target.value
                            )
                        }
                        placeholder="Additional notes..."
                    />

                </div>

                <div className="border rounded-lg p-6">

                    <h2 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">
                        Bill Summary
                    </h2>

                    <div className="space-y-3 text-sm">

                        <div className="flex justify-between">

                            <span className="text-muted-foreground">
                                Subtotal
                            </span>

                            <span>
                                {formatCurrency(
                                    calculations.subtotal
                                )}
                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-muted-foreground">
                                Discount
                            </span>

                            <span>
                                -
                                {formatCurrency(
                                    calculations.discount
                                )}
                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-muted-foreground">
                                Taxable Amount
                            </span>

                            <span>
                                {formatCurrency(
                                    calculations.taxable
                                )}
                            </span>

                        </div>

                        <div className="flex justify-between">

                            <span className="text-muted-foreground">
                                GST
                            </span>

                            <span>
                                {formatCurrency(
                                    calculations.gst
                                )}
                            </span>

                        </div>

                        <div className="border-t pt-4 mt-4">

                            <div className="flex items-center justify-between">

                                <span className="font-semibold text-base">
                                    GRAND TOTAL
                                </span>

                                <span className="font-display text-2xl font-bold">
                                    {formatCurrency(
                                        calculations.grandTotal
                                    )}
                                </span>

                            </div>

                            <div className="mt-4 p-3 bg-secondary/50 rounded-md">

                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                    Amount in Words
                                </div>

                                <div className="font-medium text-sm leading-5">
                                    {numberToWordsIndian(
                                        calculations.grandTotal
                                    )}
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ===================================================
          GST / BANK / QR / SIGNATURE
      =================================================== */}

            <div className="border rounded-lg overflow-hidden">

                <div className="border-b p-4 text-center">

                    <div className="font-semibold text-sm">

                        GSTIN :{" "}
                        {COMPANY_GSTIN}

                        <span className="mx-2">
                            •
                        </span>

                        STATE CODE :{" "}
                        {COMPANY_STATE_CODE}

                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3">

                    {/* BANK */}

                    <div className="p-6 border-b md:border-b-0 md:border-r">

                        <h3 className="font-display font-semibold uppercase text-sm mb-4">
                            Bank Details
                        </h3>

                        <div className="space-y-3 text-sm">

                            <div>

                                <div className="text-xs text-muted-foreground">
                                    Bank
                                </div>

                                <div className="font-semibold">
                                    {BANK_NAME}
                                </div>

                            </div>

                            <div>

                                <div className="text-xs text-muted-foreground">
                                    A/C No.
                                </div>

                                <div className="font-semibold font-mono">
                                    {BANK_ACCOUNT}
                                </div>

                            </div>

                            <div>

                                <div className="text-xs text-muted-foreground">
                                    IFSC
                                </div>

                                <div className="font-semibold font-mono">
                                    {BANK_IFSC}
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* QR */}

                    <div className="p-6 border-b md:border-b-0 md:border-r flex flex-col items-center justify-center">

                        <div className="text-xs uppercase tracking-wider font-semibold mb-3">
                            Scan To Pay
                        </div>

                        <img
                            src={
                                PHONEPE_QR
                            }
                            alt="PhonePe Scan To Pay"
                            className="w-40 h-40 object-contain"
                        />

                        <div className="text-xs text-muted-foreground mt-2 text-center">
                            Scan & Pay Using
                            PhonePe App
                        </div>

                    </div>

                    {/* SIGNATURE */}

                    <div className="p-6 flex flex-col justify-between min-h-[230px]">

                        <div className="text-xs text-center">
                            Goods once sold will not be
                            taken back.
                        </div>

                        <div className="text-center mt-8">

                            <div className="font-semibold text-sm">
                                For{" "}
                                {COMPANY_NAME}
                            </div>

                            <div className="mt-6 mx-auto border rounded-lg p-3 max-w-[220px]">

                                <div className="h-12 flex items-center justify-center">

                                    <span className="font-serif italic text-muted-foreground text-lg">
                                        Authorised
                                    </span>

                                </div>

                                <div className="border-t pt-2 text-[10px] uppercase tracking-wider font-semibold">
                                    Authorised Signatory
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ===================================================
          BOTTOM ACTIONS
      =================================================== */}

            <div className="flex justify-end gap-3 pb-6">

                <Button
                    type="button"
                    variant="outline"
                    onClick={resetBill}
                >
                    Clear
                </Button>

                <Button
                    type="button"
                    onClick={saveBill}
                    disabled={
                        loading ||
                        items.length === 0
                    }
                >
                    <Download size={16} />
                    Save & Download PDF
                </Button>

            </div>

        </div>
    );
};

export default BillManager;