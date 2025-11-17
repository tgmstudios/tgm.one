import mermaid from 'mermaid'

export default defineNuxtPlugin(() => {
  if (process.client && typeof window !== 'undefined') {
    // Initialize mermaid with dark theme configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        // Primary colors
        primaryColor: '#3B82F6',
        primaryTextColor: '#F9FAFB',
        primaryBorderColor: '#2563EB',
        
        // Background colors
        background: '#0A0A0A',
        mainBkg: '#1F2937',
        secondBkg: '#374151',
        tertiaryColor: '#4B5563',
        
        // Text colors
        textColor: '#F9FAFB',
        secondaryTextColor: '#D1D5DB',
        
        // Line and border colors
        lineColor: '#6B7280',
        border1: '#4B5563',
        border2: '#6B7280',
        
        // Node colors
        nodeBkg: '#1F2937',
        nodeBorder: '#3B82F6',
        clusterBkg: '#111827',
        clusterBorder: '#374151',
        defaultLinkColor: '#60A5FA',
        
        // Sequence diagram colors
        actorBorder: '#3B82F6',
        actorBkg: '#1F2937',
        actorTextColor: '#F9FAFB',
        actorLineColor: '#6B7280',
        signalColor: '#F9FAFB',
        signalTextColor: '#F9FAFB',
        labelBoxBkgColor: '#1F2937',
        labelBoxBorderColor: '#3B82F6',
        labelTextColor: '#F9FAFB',
        loopTextColor: '#F9FAFB',
        activationBorderColor: '#3B82F6',
        activationBkgColor: '#374151',
        
        // Gantt colors
        sectionBkgColor: '#1F2937',
        altSectionBkgColor: '#111827',
        sectionBkgColor2: '#374151',
        excludeBkgColor: '#4B5563',
        taskBorderColor: '#3B82F6',
        taskBkgColor: '#1F2937',
        taskTextLightColor: '#F9FAFB',
        taskTextColor: '#F9FAFB',
        taskTextDarkColor: '#D1D5DB',
        taskTextOutsideColor: '#F9FAFB',
        taskTextClickableColor: '#60A5FA',
        activeTaskBorderColor: '#60A5FA',
        activeTaskBkgColor: '#2563EB',
        gridColor: '#374151',
        doneTaskBkgColor: '#10B981',
        doneTaskBorderColor: '#059669',
        critBorderColor: '#EF4444',
        critBkgColor: '#7F1D1D',
        todayLineColor: '#F59E0B',
        
        // State diagram colors
        labelColor: '#F9FAFB',
        errorBkgColor: '#7F1D1D',
        errorTextColor: '#FCA5A5',
        
        // Font
        fontSize: '16px',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        rightAngles: false,
        showSequenceNumbers: false
      },
      gantt: {
        useMaxWidth: true,
        leftPadding: 75,
        gridLineStartPadding: 35,
        fontSize: 11,
        sectionFontSize: 12,
        numberSectionStyles: 4
      }
    })
    
    // Make mermaid available globally
    window.mermaid = mermaid
    window.mermaid.initialized = true
  }
})

