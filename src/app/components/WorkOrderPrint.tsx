import { Pool, WaterAnalysis, Client } from '../types';
import { getParameterStatus } from '../lib/parameterStatus';
import { IDEAL_RANGES } from '../lib/waterAnalysis';

interface WorkOrderPrintProps {
  pool: Pool;
  analysis: WaterAnalysis;
  client?: Client;
}

export function WorkOrderPrint({ pool, analysis, client }: WorkOrderPrintProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status?: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return { label: 'Uredu', color: '#10b981', bgColor: '#d1fae5' };
      case 'warning':
        return { label: 'Upozorenje', color: '#f59e0b', bgColor: '#fef3c7' };
      case 'critical':
        return { label: 'Kritično', color: '#ef4444', bgColor: '#fee2e2' };
      default:
        return { label: 'Nepoznato', color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  const statusInfo = getStatusInfo(analysis.status);

  return (
    <div className="print-work-order" style={{
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '20mm',
      background: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
        color: 'white',
        padding: '20px',
        marginBottom: '25px',
        borderRadius: '8px',
      }}>
        <h1 style={{ margin: 0, fontSize: '28pt', fontWeight: 'bold' }}>AcquaSmart Pro</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '12pt', opacity: 0.95 }}>Radni nalog - Analiza bazenske vode</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '10pt', opacity: 0.9 }}>{formatDate(analysis.date)}</p>
      </div>

      {/* Status Badge */}
      <div style={{
        display: 'inline-block',
        padding: '10px 20px',
        borderRadius: '8px',
        backgroundColor: statusInfo.bgColor,
        color: statusInfo.color,
        fontWeight: 'bold',
        marginBottom: '20px',
        fontSize: '12pt',
      }}>
        Status: {statusInfo.label}
      </div>

      {/* Client & Pool Info */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ 
          fontSize: '16pt', 
          fontWeight: 'bold', 
          color: '#374151',
          marginBottom: '12px',
          borderBottom: '2px solid #14b8a6',
          paddingBottom: '5px',
        }}>
          Informacije o bazenu
        </h2>

        {client && (
          <div style={{ marginBottom: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold', width: '140px', padding: '4px 0' }}>Klijent:</td>
                  <td style={{ padding: '4px 0' }}>{client.name}</td>
                </tr>
                {client.phone && (
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Telefon:</td>
                    <td style={{ padding: '4px 0' }}>{client.phone}</td>
                  </tr>
                )}
                {client.email && (
                  <tr>
                    <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Email:</td>
                    <td style={{ padding: '4px 0' }}>{client.email}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', width: '140px', padding: '4px 0' }}>Naziv bazena:</td>
              <td style={{ padding: '4px 0' }}>{pool.name}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Zapremina:</td>
              <td style={{ padding: '4px 0' }}>{pool.volume} m³</td>
            </tr>
            {pool.location?.address && (
              <tr>
                <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Lokacija:</td>
                <td style={{ padding: '4px 0' }}>{pool.location.address}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Water Parameters */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ 
          fontSize: '16pt', 
          fontWeight: 'bold', 
          color: '#374151',
          marginBottom: '12px',
          borderBottom: '2px solid #14b8a6',
          paddingBottom: '5px',
        }}>
          Parametri vode
        </h2>

        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #e5e7eb',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Parametar</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #d1d5db' }}>Izmjereno</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #d1d5db' }}>Idealno</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #d1d5db' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {analysis.parameters.pH !== undefined && (
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>pH</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                  {analysis.parameters.pH.toFixed(1)}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '9pt', color: '#6b7280' }}>
                  {IDEAL_RANGES.pH.min} - {IDEAL_RANGES.pH.max}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    backgroundColor: getStatusInfo(getParameterStatus('pH', analysis.parameters.pH)).bgColor,
                    color: getStatusInfo(getParameterStatus('pH', analysis.parameters.pH)).color,
                  }}>
                    {getStatusInfo(getParameterStatus('pH', analysis.parameters.pH)).label}
                  </span>
                </td>
              </tr>
            )}
            {analysis.parameters.freeChlorine !== undefined && (
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Slobodni klor</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                  {analysis.parameters.freeChlorine.toFixed(1)} mg/L
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '9pt', color: '#6b7280' }}>
                  {IDEAL_RANGES.freeChlorine.min} - {IDEAL_RANGES.freeChlorine.max} mg/L
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    backgroundColor: getStatusInfo(getParameterStatus('freeChlorine', analysis.parameters.freeChlorine)).bgColor,
                    color: getStatusInfo(getParameterStatus('freeChlorine', analysis.parameters.freeChlorine)).color,
                  }}>
                    {getStatusInfo(getParameterStatus('freeChlorine', analysis.parameters.freeChlorine)).label}
                  </span>
                </td>
              </tr>
            )}
            {analysis.parameters.alkalinity !== undefined && (
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Alkalnost (TA)</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                  {analysis.parameters.alkalinity.toFixed(0)} mg/L
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '9pt', color: '#6b7280' }}>
                  {IDEAL_RANGES.alkalinity.min} - {IDEAL_RANGES.alkalinity.max} mg/L
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    backgroundColor: getStatusInfo(getParameterStatus('alkalinity', analysis.parameters.alkalinity)).bgColor,
                    color: getStatusInfo(getParameterStatus('alkalinity', analysis.parameters.alkalinity)).color,
                  }}>
                    {getStatusInfo(getParameterStatus('alkalinity', analysis.parameters.alkalinity)).label}
                  </span>
                </td>
              </tr>
            )}
            {analysis.parameters.hardness !== undefined && (
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Tvrdoća (CH)</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                  {analysis.parameters.hardness.toFixed(0)} mg/L
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '9pt', color: '#6b7280' }}>
                  {IDEAL_RANGES.hardness.min} - {IDEAL_RANGES.hardness.max} mg/L
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    backgroundColor: getStatusInfo(getParameterStatus('hardness', analysis.parameters.hardness)).bgColor,
                    color: getStatusInfo(getParameterStatus('hardness', analysis.parameters.hardness)).color,
                  }}>
                    {getStatusInfo(getParameterStatus('hardness', analysis.parameters.hardness)).label}
                  </span>
                </td>
              </tr>
            )}
            {analysis.parameters.temperature !== undefined && (
              <tr>
                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>Temperatura</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                  {analysis.parameters.temperature.toFixed(1)}°C
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '9pt', color: '#6b7280' }}>
                  Info
                </td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>-</td>
              </tr>
            )}
            {analysis.parameters.orp !== undefined && (
              <tr>
                <td style={{ padding: '10px' }}>ORP</td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                  {analysis.parameters.orp.toFixed(0)} mV
                </td>
                <td style={{ padding: '10px', textAlign: 'center', fontSize: '9pt', color: '#6b7280' }}>
                  {IDEAL_RANGES.orp.min} - {IDEAL_RANGES.orp.max} mV
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    backgroundColor: getStatusInfo(getParameterStatus('orp', analysis.parameters.orp)).bgColor,
                    color: getStatusInfo(getParameterStatus('orp', analysis.parameters.orp)).color,
                  }}>
                    {getStatusInfo(getParameterStatus('orp', analysis.parameters.orp)).label}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ivero Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
          <h2 style={{ 
            fontSize: '16pt', 
            fontWeight: 'bold', 
            color: '#374151',
            marginBottom: '12px',
            borderBottom: '2px solid #14b8a6',
            paddingBottom: '5px',
          }}>
            Ivero preporuke - Potrebni proizvodi
          </h2>

          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '1px solid #e5e7eb',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Proizvod</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #d1d5db' }}>Količina</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>Kategorija</th>
              </tr>
            </thead>
            <tbody>
              {analysis.recommendations.map((rec, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                    {rec.productName}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    {rec.quantity} {rec.unit}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', fontSize: '9pt', color: '#6b7280' }}>
                    {rec.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes Section */}
      {analysis.notes && (
        <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
          <h2 style={{ 
            fontSize: '16pt', 
            fontWeight: 'bold', 
            color: '#374151',
            marginBottom: '12px',
            borderBottom: '2px solid #14b8a6',
            paddingBottom: '5px',
          }}>
            Napomene
          </h2>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            whiteSpace: 'pre-wrap',
          }}>
            {analysis.notes}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '2px solid #e5e7eb',
        textAlign: 'center',
        fontSize: '9pt',
        color: '#6b7280',
      }}>
        <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '10pt', color: '#14b8a6' }}>
          Mondo Acqua d.o.o.
        </p>
        <p style={{ margin: '3px 0' }}>
          Distributivni centar Ivero proizvoda za bazene
        </p>
        <p style={{ margin: '3px 0' }}>
          www.mondoacqua.hr | info@mondoacqua.hr
        </p>
      </div>
    </div>
  );
}
