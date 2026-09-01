import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { format, parseISO } from 'date-fns'

export const exportToExcel = (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orçamentos")
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  } catch (error) {
    console.error("Erro ao exportar Excel:", error)
  }
}

const buildPDFDoc = (order: any, settings: any, protocol?: string) => {
  const companyName = settings.companyName || "LIDER REFRIGERAÇÃO"
  const logo = settings.logo || ""
  const cnpj = settings.cnpj || "00.000.000/0001-00"
  const email = settings.email || "contato@liderefrigeracao.com.br"
  const phone = settings.whatsapp || "(11) 99999-9999"
  const address = settings.address || "Av. Industrial, 1000 - Setor de Transportes"
  
  const safeText = (val: any) => String(val ?? '')
  
  const formatBRL = (val: any) => {
    const n = Number(val || 0);
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'Agendar'
    try {
      const s = String(dateStr)
      // Se for YYYY-MM-DD
      const parts = s.split('T')[0].split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      // Fallback para outros formatos
      return format(parseISO(s), 'dd/MM/yyyy')
    } catch (e) {
      return String(dateStr)
    }
  }


  const doc = new jsPDF()
  
  // --- HEADER BACKGROUND GRADIENT (VERSÃO COMPATÍVEL) ---
  for (let i = 0; i < 42; i++) {
    const factor = i / 42;
    // Gradiente suave de azul claro (R:230, G:240, B:255) para branco
    const r = Math.floor(230 + (255 - 230) * factor);
    const g = Math.floor(240 + (255 - 240) * factor);
    const b = Math.floor(255 + (255 - 255) * factor);
    doc.setFillColor(r, g, b);
    doc.rect(0, i, 210, 1, 'F');
  }
  
  // --- HEADER (CLEAN STYLE) ---
  if (logo) {
    try {
      const imgProps = doc.getImageProperties(logo)
      const ratio = imgProps.width / imgProps.height
      const targetH = 18
      const targetW = targetH * ratio
      doc.addImage(logo, 'PNG', 15, 10, targetW, targetH)
    } catch (e) {}
  }

  doc.setTextColor(26, 54, 93) // Azul Escuro
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Orçamento", 15, 32)
  
  const formatDate = (dateStr: any) => {
    if (!dateStr) return format(new Date(), 'dd/MM/yyyy')
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-')
      if (year && month && day) return `${day}/${month}/${year}`
      return format(parseISO(dateStr), 'dd/MM/yyyy')
    } catch (e) {
      return dateStr
    }
  }

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(150, 150, 150)
  const orderDate = formatDate(order.date)
  doc.text(`Gerado em: ${orderDate}`, 15, 36)
  if (protocol) {
    doc.setFont("helvetica", "bold")
    doc.text(`Protocolo: ${protocol}`, 15, 40)
    doc.setFont("helvetica", "normal")
  }

  // Info Empresa (Canto Direito)
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.text(companyName.toUpperCase(), 195, 12, { align: 'right' })
  doc.text(`CNPJ: ${cnpj}`, 195, 16, { align: 'right' })
  doc.text(phone, 195, 20, { align: 'right' })
  doc.text(email, 195, 24, { align: 'right' })

  doc.setDrawColor(240, 240, 240)
  doc.line(15, 42, 195, 42)

  // --- OTIMIZAÇÃO AUTOMÁTICA DE ESPAÇO ---
  const servicesCount = order.services ? order.services.length : 0;
  const partsCount = order.parts ? order.parts.length : 0;
  const totalItems = servicesCount + partsCount;
  
  const isCompact = totalItems > 6;
  const isVeryCompact = totalItems > 12;
  const isExtremeCompact = totalItems > 22;

  const card1H = isExtremeCompact ? 22 : (isVeryCompact ? 26 : (isCompact ? 30 : 35));
  const card2H = isExtremeCompact ? 28 : (isVeryCompact ? 32 : (isCompact ? 38 : 45));
  
  const startYCard1 = isExtremeCompact ? 41 : (isVeryCompact ? 44 : 48);
  const gapBetweenCards = isExtremeCompact ? 2 : (isVeryCompact ? 3 : (isCompact ? 4 : 5));
  const startYCard2 = startYCard1 + card1H + gapBetweenCards;
  
  const gapBeforeTable = isExtremeCompact ? 3 : (isVeryCompact ? 5 : (isCompact ? 7 : 9));
  const tableTitleY = startYCard2 + card2H + gapBeforeTable;
  const tableStartY = tableTitleY + (isExtremeCompact ? 1.5 : (isVeryCompact ? 2 : 3));
  
  const boxH = isExtremeCompact ? 34 : (isVeryCompact ? 40 : (isCompact ? 48 : 55));

  // --- CARDS ROW 1 (CLIENTE E VEÍCULO) ---
  let cy1 = startYCard1;
  // Card Cliente
  doc.setFillColor(252, 252, 252)
  doc.roundedRect(15, cy1, 85, card1H, 3, 3, "F")
  doc.setDrawColor(230, 230, 230)
  doc.roundedRect(15, cy1, 85, card1H, 3, 3, "D")
  
  doc.setTextColor(26, 54, 93)
  doc.setFontSize(isExtremeCompact ? 7 : (isVeryCompact ? 8 : 9))
  doc.setFont("helvetica", "bold")
  doc.text("DADOS DO CLIENTE", 20, cy1 + (isExtremeCompact ? 4 : 5))
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(isExtremeCompact ? 9 : (isVeryCompact ? 10 : 11))
  doc.text(safeText(order.clientName), 20, cy1 + (isExtremeCompact ? 9 : (isVeryCompact ? 11 : (isCompact ? 12 : 13))))
  doc.setFontSize(isExtremeCompact ? 7 : (isVeryCompact ? 8 : 9))
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 100, 100)
  const sp1 = isExtremeCompact ? 3.5 : (isVeryCompact ? 4 : (isCompact ? 4.5 : 5));
  let cY = cy1 + (isExtremeCompact ? 9 : (isVeryCompact ? 11 : (isCompact ? 12 : 13))) + sp1 + (isExtremeCompact ? 0 : 1);
  doc.text(`Doc: ${order.document || 'N/A'}`, 20, cY)
  cY += sp1;
  doc.text(`Tel: ${order.phone || 'N/A'}`, 20, cY)
  cY += sp1;
  doc.text(`Email: ${order.email || 'N/A'}`, 20, cY)

  // Card Veículo
  doc.setFillColor(252, 252, 252)
  doc.roundedRect(110, cy1, 85, card1H, 3, 3, "F")
  doc.setDrawColor(230, 230, 230)
  doc.roundedRect(110, cy1, 85, card1H, 3, 3, "D")

  doc.setTextColor(26, 54, 93)
  doc.setFontSize(isExtremeCompact ? 7 : (isVeryCompact ? 8 : 9))
  doc.setFont("helvetica", "bold")
  doc.text("VEÍCULO E EQUIPAMENTO", 115, cy1 + (isExtremeCompact ? 4 : 5))

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(isExtremeCompact ? 9 : (isVeryCompact ? 10 : 11))
  doc.text(safeText(order.plate), 115, cy1 + (isExtremeCompact ? 9 : (isVeryCompact ? 11 : (isCompact ? 12 : 13))))
  doc.setFontSize(isExtremeCompact ? 8 : (isVeryCompact ? 9 : 10))
  doc.setTextColor(59, 130, 246) // Azul claro
  let vY = cy1 + (isExtremeCompact ? 9 : (isVeryCompact ? 11 : (isCompact ? 12 : 13))) + (isExtremeCompact ? 4 : (isVeryCompact ? 4.5 : 6));
  doc.text(safeText(order.vehicleModel), 115, vY)
  
  vY += (isExtremeCompact ? 3.5 : (isVeryCompact ? 4.5 : 6));
  doc.setFontSize(isExtremeCompact ? 7 : (isVeryCompact ? 8 : 9))
  doc.setTextColor(100, 100, 100)
  doc.setFont("helvetica", "bold")
  doc.text("EQUIPAMENTO", 115, vY)
  doc.setFont("helvetica", "normal")
  vY += (isExtremeCompact ? 3 : (isVeryCompact ? 4 : 5));
  doc.text(safeText(`${order.equipBrand || ''} ${order.equipModel || ''}`), 115, vY)

  // --- CARDS ROW 2 (DIAGNÓSTICO E CRONOGRAMA) ---
  let cy2 = startYCard2;
  // Card Diagnóstico
  doc.setFillColor(252, 252, 252)
  doc.roundedRect(15, cy2, 85, card2H, 3, 3, "F")
  doc.setDrawColor(230, 230, 230)
  doc.roundedRect(15, cy2, 85, card2H, 3, 3, "D")

  doc.setTextColor(26, 54, 93)
  doc.setFontSize(isExtremeCompact ? 7 : (isVeryCompact ? 8 : 9))
  doc.setFont("helvetica", "bold")
  doc.text("DIAGNÓSTICO TÉCNICO", 20, cy2 + (isExtremeCompact ? 4 : 5))

  doc.setFontSize(isExtremeCompact ? 6 : (isVeryCompact ? 7 : 8))
  doc.setTextColor(59, 130, 246)
  let dY = cy2 + (isExtremeCompact ? 7.5 : (isVeryCompact ? 9 : 11));
  doc.text("PROBLEMA RELATADO", 20, dY)
  doc.setTextColor(80, 80, 80)
  doc.setFont("helvetica", "normal")
  dY += (isExtremeCompact ? 3 : (isVeryCompact ? 3.5 : 4));
  const problemText = doc.splitTextToSize(order.problem || "N/A", 75)
  const probLines = (isExtremeCompact || isVeryCompact) && problemText.length > 2 ? problemText.slice(0, 2) : problemText;
  doc.text(probLines, 20, dY)

  dY += (probLines.length * (isExtremeCompact ? 3 : (isVeryCompact ? 3.5 : 4))) + (isExtremeCompact ? 1.5 : (isVeryCompact ? 2 : 4));
  doc.setFontSize(isExtremeCompact ? 6 : (isVeryCompact ? 7 : 8))
  doc.setTextColor(59, 130, 246)
  doc.setFont("helvetica", "bold")
  doc.text("DIAGNÓSTICO", 20, dY)
  doc.setTextColor(80, 80, 80)
  doc.setFont("helvetica", "normal")
  dY += (isExtremeCompact ? 3 : (isVeryCompact ? 3.5 : 4));
  const diagnosisText = doc.splitTextToSize(order.diagnosis || "N/A", 75)
  const diagLines = (isExtremeCompact || isVeryCompact) && diagnosisText.length > 2 ? diagnosisText.slice(0, 2) : diagnosisText;
  doc.text(diagLines, 20, dY)

  // Card Cronograma
  doc.setFillColor(252, 252, 252)
  doc.roundedRect(110, cy2, 85, card2H, 3, 3, "F")
  doc.setDrawColor(230, 230, 230)
  doc.roundedRect(110, cy2, 85, card2H, 3, 3, "D")

  doc.setTextColor(26, 54, 93)
  doc.setFontSize(isExtremeCompact ? 7 : (isVeryCompact ? 8 : 9))
  doc.setFont("helvetica", "bold")
  doc.text("CRONOGRAMA PREVISTO", 115, cy2 + (isExtremeCompact ? 4 : 5))

  let cBoxH = isExtremeCompact ? 7.5 : (isVeryCompact ? 9 : (isCompact ? 10 : 12));
  let cYBox1 = cy2 + (isExtremeCompact ? 5.5 : (isVeryCompact ? 7 : 10));
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(115, cYBox1, 75, cBoxH, 2, 2, "F")
  doc.setDrawColor(245, 245, 245)
  doc.roundedRect(115, cYBox1, 75, cBoxH, 2, 2, "D")
  doc.setFontSize(isExtremeCompact ? 6 : (isVeryCompact ? 7 : 8))
  doc.setTextColor(150, 150, 150)
  let cTextY1 = cYBox1 + (cBoxH / 2) + 1;
  doc.text("INÍCIO ESTIMADO", 118, cTextY1)
  doc.setTextColor(26, 54, 93)
  doc.setFont("helvetica", "bold")
  doc.text(formatDateTime(order.startTime), 185, cTextY1, { align: 'right' })

  let cYBox2 = cYBox1 + cBoxH + (isExtremeCompact ? 1.5 : (isVeryCompact ? 2 : 3));
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(115, cYBox2, 75, cBoxH, 2, 2, "F")
  doc.setDrawColor(245, 245, 245)
  doc.roundedRect(115, cYBox2, 75, cBoxH, 2, 2, "D")
  doc.setFontSize(isExtremeCompact ? 6 : (isVeryCompact ? 7 : 8))
  doc.setTextColor(150, 150, 150)
  doc.setFont("helvetica", "normal")
  let cTextY2 = cYBox2 + (cBoxH / 2) + 1;
  doc.text("FIM ESTIMADO", 118, cTextY2)
  doc.setTextColor(26, 54, 93)
  doc.setFont("helvetica", "bold")
  doc.text(formatDateTime(order.endTime), 185, cTextY2, { align: 'right' })
  
  // Duração Total
  if (order.startTime && order.endTime) {
    try {
      const start = new Date(order.startTime)
      const end = new Date(order.endTime)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
      
      let tagY = cYBox2 + cBoxH + (isExtremeCompact ? 1.5 : (isVeryCompact ? 2 : 3));
      doc.setFillColor(59, 130, 246)
      doc.roundedRect(165, tagY, 30, 5, 1, 1, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(isExtremeCompact ? 5.5 : (isVeryCompact ? 6 : 7))
      doc.text(`${diffDays} DIAS TOTAL`, 180, tagY + 3.5, { align: 'center' })
    } catch (e) {}
  }


  // --- TABELA DE ITENS ---
  doc.setTextColor(26, 54, 93)
  doc.setFontSize(isExtremeCompact ? 8 : (isVeryCompact ? 9 : 10))
  doc.text("ITENS DO ORÇAMENTO", 15, tableTitleY)

  const services = order.services || []
  const parts = order.parts || []
  const tableData = [
    ...parts.map((p: any) => [safeText(p.name || p.description), "Peça / Insumo", safeText(p.quantity || p.qty), formatBRL(p.value), formatBRL((p.quantity || p.qty) * p.value)]),
    ...services.map((s: any) => [safeText(s.description), "Mão de Obra", safeText(s.qty || 1), formatBRL(s.value), formatBRL((s.qty || 1) * s.value)]),
  ]

  try {
    autoTable(doc, {
      startY: tableStartY,
      head: [["DESCRIÇÃO", "TIPO", "QTD", "UNITÁRIO", "SUBTOTAL"]],
      body: tableData,
      headStyles: { 
        fillColor: [245, 245, 245], // Cinza mais clarinho
        textColor: [0, 0, 0], // Preto para contraste no cinza
        fontSize: isExtremeCompact ? 6.5 : (isVeryCompact ? 7 : 8), 
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { 
        fontSize: isExtremeCompact ? 6.5 : (isVeryCompact ? 7 : (isCompact ? 8 : 9)), 
        textColor: [0, 0, 0] 
      },
      styles: {
        cellPadding: isExtremeCompact ? 0.5 : (isVeryCompact ? 1 : (isCompact ? 1.5 : 3)),
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
      },
      theme: "plain", // Remove o zebrado (listras)
      // Garantir que a tabela sempre deixe espaço no final para a caixa de totais
      margin: { left: 15, right: 15, bottom: boxH + 15 },
      didDrawCell: (data) => {
         if (data.section === 'body' && data.column.index === 4) {
            doc.setTextColor(0, 0, 0)
         }
      }
    })
  } catch (e) {
    console.error("Erro ao gerar tabela no PDF:", e)
    doc.text("Erro ao carregar itens do orçamento.", 15, tableStartY + 5)
  }

  let finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + (isExtremeCompact ? 2 : (isVeryCompact ? 4 : 10)) : tableStartY + 5
  
  const pageHeight = doc.internal.pageSize.getHeight();
  if (finalY + boxH > pageHeight - 10) {
    doc.addPage()
    finalY = 20
  }

  // --- SUMMARY BOX (BLUE) ---
  const boxW = 85
  const boxX = 110
  const boxY = finalY

  doc.setFillColor(26, 54, 93)
  doc.roundedRect(boxX, boxY, boxW, boxH, 5, 5, "F")
  
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(isExtremeCompact ? 7.5 : (isVeryCompact ? 8 : 9))
  doc.setFont("helvetica", "normal")
  
  let sY = boxY + (isExtremeCompact ? 6 : (isVeryCompact ? 7 : (isCompact ? 9 : 12)));
  doc.text("Mão de Obra Total:", boxX + 5, sY)
  doc.text(formatBRL(order.servicesValue), boxX + boxW - 5, sY, { align: 'right' })
  
  sY += (isExtremeCompact ? 5 : (isVeryCompact ? 6 : (isCompact ? 7 : 8)));
  doc.text("Peças Total:", boxX + 5, sY)
  doc.text(formatBRL(order.partsValue), boxX + boxW - 5, sY, { align: 'right' })
  
  sY += (isExtremeCompact ? 5 : (isVeryCompact ? 6 : (isCompact ? 7 : 8)));
  doc.text("Deslocamento:", boxX + 5, sY)
  doc.text(formatBRL(order.travelValue), boxX + boxW - 5, sY, { align: 'right' })
  
  sY += (isExtremeCompact ? 3 : (isVeryCompact ? 4 : 6));
  doc.setDrawColor(255, 255, 255, 0.2)
  doc.line(boxX + 5, sY, boxX + boxW - 5, sY)
  
  sY += (isExtremeCompact ? 5 : (isVeryCompact ? 6 : 8));
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(isExtremeCompact ? 9 : (isVeryCompact ? 10 : 11))
  doc.setFont("helvetica", "bold")
  doc.text("Subtotal:", boxX + 5, sY)
  const subTotal = (order.servicesValue || 0) + (order.partsValue || 0) + (order.travelValue || 0)
  doc.text(formatBRL(subTotal), boxX + boxW - 5, sY, { align: 'right' })

  sY += (isExtremeCompact ? 5 : (isVeryCompact ? 6 : 8));
  doc.setTextColor(255, 215, 0) // Gold/Yellow
  doc.setFontSize(isExtremeCompact ? 12 : (isVeryCompact ? 14 : 16))
  doc.text("TOTAL:", boxX + 5, sY)
  doc.text(formatBRL(order.total), boxX + boxW - 5, sY, { align: 'right' })

  // Info Final (Bottom Left)
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(isExtremeCompact ? 6 : (isVeryCompact ? 7 : (isCompact ? 8 : 9)))
  doc.setFont("helvetica", "normal")
  doc.text(safeText(`Garantia: ${order.warranty || '90 dias'}`), 15, boxY + (isExtremeCompact ? 6 : (isVeryCompact ? 8 : 12)))
  doc.text(safeText(`Técnico Responsável: ${order.technician || 'Admin'}`), 15, boxY + (isExtremeCompact ? 10 : (isVeryCompact ? 14 : 20)))

  return doc
}

export const generateServiceOrderPDF = (order: any, settings?: any, protocol?: string) => {
  if (!order) return
  const companyInfo = settings || {}
  const doc = buildPDFDoc(order, companyInfo, protocol)
  
  const firstName = order.clientName ? order.clientName.split(' ')[0].toUpperCase() : 'CLIENTE'
  doc.save(`Orcamento_${firstName}_${protocol || order.id}.pdf`)
}


export const sendToWhatsApp = (order: any, settings?: any) => {
  if (!order || !order.phone) {
    alert('Telefone do cliente não informado.')
    return
  }
  
  // Limpa o número e garante o prefixo 55 se for brasileiro (10 ou 11 dígitos)
  let cleanPhone = order.phone.replace(/\D/g, '')
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = '55' + cleanPhone
  }

  const tech = order.technician ? `\n*Técnico:* ${order.technician}` : ''
  const text = `*ORÇAMENTO LIDER REFRIGERAÇÃO - #${order.id}*\n\nOlá ${order.clientName},\nSegue o orçamento referente ao veículo *${order.plate}*.\n\n*Total:* R$ ${order.total.toFixed(2)}\n*Status:* ${order.status}${tech}\n\nO PDF detalhado foi gerado. Caso não tenha recebido, por favor nos avise.`
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
}

// ---- EXPORTAÇÃO DE VIAGENS (GEVI) ----

export const exportViagemToExcel = (viagem: any) => {
  try {
    const dados = [
      {
        "Placa": viagem.placa,
        "Origem": viagem.origem,
        "Destino": viagem.destino,
        "KM Total": viagem.kmTotal,
        "Litros": viagem.totalLitros,
        "Custo Combustível": viagem.custoCombustivel,
        "Outras Despesas": viagem.custoDespesas,
        "Custo Total": viagem.custoTotalViagem,
        "Custo/KM": viagem.custoPorKm,
        "Data": new Date(viagem.dataFim).toLocaleDateString('pt-BR')
      }
    ]
    const worksheet = XLSX.utils.json_to_sheet(dados)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Viagem")
    XLSX.writeFile(workbook, `Relatorio_Viagem_${viagem.placa}.xlsx`)
  } catch (error) {
    console.error("Erro ao exportar Viagem para Excel:", error)
  }
}

export const generateViagemPDF = (viagem: any, settings?: any) => {
  if (!viagem) return
  const companyName = settings?.companyName || "LIDER REFRIGERAÇÃO"
  const doc = new jsPDF()

  // Header Colors
  doc.setFillColor(29, 78, 216)
  doc.rect(0, 0, 210, 40, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(companyName.toUpperCase(), 15, 20)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("RELATÓRIO DE VIAGEM (GEVI)", 15, 30)

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(`PLACA: ${viagem.placa}`, 195, 25, { align: 'right' })

  // Body
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("DADOS DA ROTA", 15, 55)
  doc.setDrawColor(220, 220, 220)
  doc.line(15, 58, 195, 58)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Origem: ${viagem.origem}`, 15, 65)
  doc.text(`Destino: ${viagem.destino}`, 15, 72)
  doc.text(`KM Inicial: ${viagem.kmInicial}`, 110, 65)
  doc.text(`KM Final: ${viagem.kmFinal}`, 110, 72)
  doc.text(`Distância Total: ${viagem.kmTotal} km`, 15, 79)
  doc.text(`Data Encerramento: ${new Date(viagem.dataFim).toLocaleString('pt-BR')}`, 110, 79)

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("PERFORMANCE E CUSTOS", 15, 95)
  doc.line(15, 98, 195, 98)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Total Abastecido: ${viagem.totalLitros.toFixed(1)} L`, 15, 105)
  doc.text(`Custo Combustível: R$ ${viagem.custoCombustivel.toFixed(2)}`, 110, 105)
  doc.text(`Média de Consumo: ${viagem.mediaKmPorLitro.toFixed(2)} km/L`, 15, 112)
  doc.text(`Outras Despesas: R$ ${viagem.custoDespesas.toFixed(2)}`, 110, 112)
  
  doc.setFont("helvetica", "bold")
  doc.text(`CUSTO TOTAL DA VIAGEM: R$ ${viagem.custoTotalViagem.toFixed(2)}`, 15, 125)
  doc.text(`CUSTO POR KM: R$ ${viagem.custoPorKm.toFixed(2)}/km`, 110, 125)

  // Categorias se existirem
  if (viagem.despesasPorCategoria && Object.keys(viagem.despesasPorCategoria).length > 0) {
    doc.setFontSize(12)
    doc.text("RESUMO DE DESPESAS POR CATEGORIA", 15, 140)
    doc.line(15, 143, 195, 143)

    const catData = Object.entries(viagem.despesasPorCategoria).map(([cat, valor]) => [cat, `R$ ${(valor as number).toFixed(2)}`])
    const isCompact = catData.length > 8;
    
    autoTable(doc, {
      startY: 148,
      head: [["Categoria", "Valor Gasto"]],
      body: catData,
      headStyles: { fillColor: [26, 54, 93], fontSize: isCompact ? 8 : 10 },
      styles: { cellPadding: isCompact ? 1 : 3 },
      bodyStyles: { fontSize: isCompact ? 8 : 10 },
      theme: "striped",
    })
  }

  doc.save(`Relatorio_Viagem_${viagem.placa}.pdf`)
}

// ---- EXPORTAÇÃO DE TABELAS GENÉRICAS ----

export const exportTableToCSV = (data: any[], fileName: string) => {
  if (!data || !data.length) return
  
  const headers = Object.keys(data[0])
  const csvRows = []
  
  csvRows.push(headers.join(','))
  
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }
  
  const csvString = csvRows.join('\n')
  const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${fileName}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportTableToExcel = (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados")
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  } catch (error) {
    console.error("Erro ao exportar tabela para Excel:", error)
  }
}

export const exportTableToPDF = (data: any[], fileName: string, title: string = "Relatório", settings?: any) => {
  if (!data || !data.length) return
  
  const companyName = settings?.companyName || "LIDER REFRIGERAÇÃO"
  const doc = new jsPDF()

  // Header Colors
  doc.setFillColor(29, 78, 216)
  doc.rect(0, 0, 210, 30, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(companyName.toUpperCase(), 15, 15)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(title, 15, 23)
  
  doc.setFontSize(9)
  doc.text(`Data da Exportação: ${new Date().toLocaleString('pt-BR')}`, 195, 20, { align: 'right' })

  const headers = Object.keys(data[0])
  const bodyData = data.map(row => headers.map(h => row[h]))

  const isCompact = bodyData.length > 20;

  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: bodyData,
    headStyles: { fillColor: [26, 54, 93], fontSize: isCompact ? 7 : 8 },
    bodyStyles: { fontSize: isCompact ? 7 : 8 },
    styles: { cellPadding: isCompact ? 1 : 3 },
    theme: "striped",
  })

  doc.save(`${fileName}.pdf`)
}
