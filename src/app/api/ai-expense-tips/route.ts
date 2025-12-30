import { NextRequest, NextResponse } from 'next/server';

type Expense = {
  id: string;
  comment: string;
  amount: number;
  category: {
    id: string;
    name: string;
  };
  date: string;
};

type AITip = {
  id: string;
  type: 'insight' | 'warning' | 'opportunity' | 'achievement';
  title: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  category?: string;
  savings?: number;
};

type CachedTips = {
  tips: AITip[];
  generatedDate: string;
  expenseCount: number;
};

// In-memory cache for daily tips (in production, use Redis or database)
let dailyTipsCache: CachedTips | null = null;

// Helper function to check if tips should be regenerated
function shouldRegenerateTips(expenses: Expense[]): boolean {
  if (!dailyTipsCache) return true;
  
  const today = new Date().toDateString();
  const cacheDate = new Date(dailyTipsCache.generatedDate).toDateString();
  
  // Regenerate if it's a new day OR if expense count changed significantly
  const expenseCountChanged = Math.abs(expenses.length - dailyTipsCache.expenseCount) > 5;
  
  return today !== cacheDate || expenseCountChanged;
}

// Helper function to analyze spending patterns (fallback)
function analyzeSpendingPatterns(expenses: Expense[]): AITip[] {
  const tips: AITip[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get current month expenses
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  // Get previous month expenses
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousYear;
  });

  // Category analysis
  const categoryTotals: { [key: string]: { amount: number; count: number } } = {};
  currentMonthExpenses.forEach(expense => {
    const categoryName = expense.category.name;
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = { amount: 0, count: 0 };
    }
    categoryTotals[categoryName].amount += expense.amount;
    categoryTotals[categoryName].count += 1;
  });

  // Find highest spending category
  const highestCategory = Object.entries(categoryTotals).reduce((max, [category, data]) => {
    return data.amount > max.amount ? { category, amount: data.amount } : max;
  }, { category: '', amount: 0 });

  if (highestCategory.amount > 0) {
    tips.push({
      id: 'highest-category',
      type: 'insight',
      title: `${highestCategory.category} leads your spending`,
      message: `$${highestCategory.amount.toFixed(2)} spent on ${highestCategory.category} this month. Consider if this aligns with your financial priorities.`,
      impact: 'medium',
      actionable: true,
      category: highestCategory.category
    });
  }

  // Month-over-month comparison
  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  if (previousMonthTotal > 0) {
    const percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    
    if (Math.abs(percentageChange) > 10) {
      tips.push({
        id: 'month-comparison',
        type: percentageChange > 0 ? 'warning' : 'achievement',
        title: `${percentageChange > 0 ? 'Spending increased' : 'Spending decreased'} by ${Math.abs(percentageChange).toFixed(1)}%`,
        message: `Compared to last month, you've ${percentageChange > 0 ? 'spent' : 'saved'} $${Math.abs(currentMonthTotal - previousMonthTotal).toFixed(2)} ${percentageChange > 0 ? 'more' : 'less'}.`,
        impact: Math.abs(percentageChange) > 25 ? 'high' : 'medium',
        actionable: percentageChange > 0,
        savings: percentageChange < 0 ? Math.abs(currentMonthTotal - previousMonthTotal) : undefined
      });
    }
  }

  // Frequent small purchases detection
  const smallPurchases = currentMonthExpenses.filter(expense => expense.amount < 10);
  const smallPurchasesTotal = smallPurchases.reduce((sum, expense) => sum + expense.amount, 0);
  
  if (smallPurchases.length > 10 && smallPurchasesTotal > 30) {
    tips.push({
      id: 'small-purchases',
      type: 'opportunity',
      title: 'Small purchases adding up',
      message: `${smallPurchases.length} purchases under $10 totaled $${smallPurchasesTotal.toFixed(2)}. Tracking these could reveal savings opportunities.`,
      impact: 'medium',
      actionable: true,
      savings: Math.round(smallPurchasesTotal * 0.25)
    });
  }

  // Return exactly 3 tips, prioritizing by impact
  return tips
    .sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    })
    .slice(0, 3);
}

// AI-powered tip generation using Claude API (limited to 3 tips)
async function generateDailyAITips(expenses: Expense[]): Promise<AITip[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('📊 No API key found, using pattern analysis for daily tips');
    return analyzeSpendingPatterns(expenses);
  }

  // Prepare concise expense data for AI analysis
  const expenseData = {
    totalExpenses: expenses.length,
    currentMonth: new Date().getMonth() + 1,
    categories: [...new Set(expenses.map(e => e.category.name))],
    recentExpenses: expenses.slice(-20), // Last 20 expenses only
    monthlyTotals: getMonthlyTotals(expenses)
  };

  try {
    console.log('🤖 Generating daily AI tips (3 tips max)...');
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600, // Reduced tokens for cost efficiency
        messages: [
          {
            role: "user",
            content: `Generate exactly 3 daily financial tips based on this expense data. Be concise but actionable.

Expense data: ${JSON.stringify(expenseData, null, 2)}

Return ONLY a JSON array with exactly 3 objects:
[{
  "id": "unique-id",
  "type": "insight|warning|opportunity|achievement",
  "title": "Brief title (max 50 chars)",
  "message": "Actionable advice (max 150 chars)",
  "impact": "high|medium|low",
  "actionable": true/false,
  "category": "optional category",
  "savings": optional_number
}]

Focus on the most impactful insights. Keep messages concise and actionable.`
          }
        ],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 Claude API Error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (content) {
      try {
        console.log('🎯 Claude AI response received for daily tips');
        
        // Clean up the response to extract JSON
        let cleanContent = content.trim();
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        const jsonMatch = cleanContent.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          const aiTips = JSON.parse(jsonMatch[0]);
          
          // Ensure exactly 3 tips and validate format
          const validTips = aiTips.slice(0, 3).map((tip: any, index: number) => ({
            id: tip.id || `daily-tip-${Date.now()}-${index}`,
            type: ['insight', 'warning', 'opportunity', 'achievement'].includes(tip.type) ? tip.type : 'insight',
            title: tip.title || 'Financial Insight',
            message: tip.message || 'Review your spending patterns for optimization opportunities.',
            impact: ['high', 'medium', 'low'].includes(tip.impact) ? tip.impact : 'medium',
            actionable: Boolean(tip.actionable),
            category: tip.category || undefined,
            savings: typeof tip.savings === 'number' ? tip.savings : undefined
          }));
          
          console.log('✅ Generated 3 daily AI tips successfully');
          return validTips;
        } else {
          throw new Error('Invalid JSON in Claude response');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse Claude AI response:', parseError);
        throw parseError;
      }
    } else {
      throw new Error('No content in Claude response');
    }
  } catch (error) {
    console.error('🚨 Claude AI Error:', error);
    console.log('🔄 Falling back to pattern analysis for daily tips...');
    return analyzeSpendingPatterns(expenses);
  }
}

function getMonthlyTotals(expenses: Expense[]) {
  const monthlyTotals: { [key: string]: number } = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
  });
  
  return monthlyTotals;
}

export async function POST(request: NextRequest) {
  try {
    const { expenses } = await request.json();

    if (!expenses || !Array.isArray(expenses)) {
      return NextResponse.json(
        { error: 'Invalid expenses data' },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing ${expenses.length} expenses for daily tips...`);

    // Check if we need to regenerate tips
    if (!shouldRegenerateTips(expenses)) {
      console.log('📅 Using cached daily tips (same day, similar expense count)');
      return NextResponse.json({
        tips: dailyTipsCache!.tips,
        timestamp: dailyTipsCache!.generatedDate,
        expenseCount: expenses.length,
        cached: true,
        aiEnabled: Boolean(process.env.ANTHROPIC_API_KEY)
      });
    }

    // Generate new daily tips (exactly 3)
    const tips = await generateDailyAITips(expenses);

    // Cache the tips
    dailyTipsCache = {
      tips,
      generatedDate: new Date().toISOString(),
      expenseCount: expenses.length
    };

    console.log(`💡 Generated ${tips.length} fresh daily tips`);

    return NextResponse.json({
      tips,
      timestamp: new Date().toISOString(),
      expenseCount: expenses.length,
      cached: false,
      aiEnabled: Boolean(process.env.ANTHROPIC_API_KEY)
    });

  } catch (error) {
    console.error('❌ Error generating daily tips:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily tips' },
      { status: 500 }
    );
  }
}