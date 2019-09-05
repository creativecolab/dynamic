library(pscl)

# read full data in
training.data.raw <- read.csv('dyad_data_master.csv', header=T, na.strings=c(""))
individual.data.raw <- read.csv('individual_data.csv', header=T, na.strings=c(""))

indv_cols <- c('Age','Creativity' ,'Prior.Social.Connections','Psychological.Collectivism','Social.Skills','Leadership','Intercultural.Sensitivity','Imagination','Extraversion','Emotional.Stability','Agreeableness','Conscientiousness','Concrete.Design','Content.Strategy','Site.Strategy','Technology.Strategy','User.Research','Content.Production','Project.Management','Abstract.Design','Technology.Implementation') # extract relevant cols
data <- subset(individual.data.raw, select = indv_cols)

# general stepwise regression... remove pillars and dyad labels
data <- subset(training.data.raw, select = -c(mutual, dyad, interacted, both_male, both_non_binary, both_female, social_tie, u_r, s_s, t_s, c_s, a_d, t_i, c_p, c_d, p_m))

# min-max normalization
normalize <- function(x) {
  return ((x - min(x)) / (max(x) - min(x)))
}

# shuffle rows
set.seed(14)
rows <- sample(nrow(data))
data <- data[rows, ]

hist(data$social_skills)
mean(data$social_skills)
sd(data$social_skills)

#cor(my_data, method = "pearson")

#hist(data$avg_rating)

# normalize data
scaled.data <- as.data.frame(lapply(data, normalize))
library("Hmisc")
corr <- rcorr(as.matrix(data))
#res2 <- rcorr(as.matrix(my_data))
#res2
#res2

corr.r <- data.frame(corr$r)
write.csv(corr.r,"corr_r.csv")
corr.P <- data.frame(corr$P)
write.csv(corr.P,"corr_P.csv")

#hist(scaled.data$interacted)
hist(scaled.data$social_skills)
#hist(scaled.data$ixr)

plot(data$Age, data$School.Year)

# subset into trains and test datasets
train <- scaled.data[1:800,]
test <- scaled.data[801:990,]

# create model
model <- glm(team ~., family=binomial(link='logit'), data=train)
selectedMod <- step(model)

summary(selectedMod)

all_vifs <- car::vif(selectedMod)
print(all_vifs)

signif_all <- names(all_vifs)

# Remove vars with VIF> 4 and re-build model until none of VIFs don't exceed 4.
while(any(all_vifs > 4)){
  var_with_max_vif <- names(which(all_vifs == max(all_vifs)))  # get the var with max vif
  signif_all <- signif_all[!(signif_all) %in% var_with_max_vif]  # remove
  myForm <- as.formula(paste("team ~ ", paste (signif_all, collapse=" + "), sep=""))  # new formula
  selectedMod <- glm(myForm, family=binomial(link='logit'), data=train)  # re-build model with new formula
  all_vifs <- car::vif(selectedMod)
}
summary(selectedMod)


all_vars <- names(selectedMod[[1]])[-1]  # names of all X variables
# Get the non-significant vars
summ <- summary(selectedMod)  # model summary
pvals <- summ$coefficients[, 4]  # get all p values
not_significant <- character()  # init variables that aren't statsitically significant
not_significant <- names(which(pvals > 0.1))
not_significant <- not_significant[!not_significant %in% "(Intercept)"]  # remove 'intercept'. Optional!

# If there are any non-significant variables, 
while(length(not_significant) > 0) {
  all_vars <- all_vars[!all_vars %in% not_significant[1]]
  myForm <- as.formula(paste("team ~ ", paste (all_vars, collapse=" + "), sep=""))  # new formula
  selectedMod <- glm(myForm, family=binomial(link='logit'), data=train)  # re-build model with new formula
  
  # Get the non-significant vars.
  summ <- summary(selectedMod)
  pvals <- summ$coefficients[, 4]  # get all p values
  not_significant <- character()
  not_significant <- names(which(pvals > 0.1))
  not_significant <- not_significant[!not_significant %in% "(Intercept)"]
}
summary(selectedMod)

# anova
anova(selectedMod, test="Chisq")

pR2(selectedMod)

fitted.results <- predict(selectedMod, newdata=subset(test), type='response')
fitted.results <- ifelse(fitted.results > 0.5, 1, 0)
misClasificError <- mean(fitted.results != test$team)
print(paste('Accuracy =', 1 - misClasificError))


library(ROCR)
p <- predict(selectedMod, newdata=subset(test), type="response")
pr <- prediction(p, test$team)
prf <- performance(pr, measure = "tpr", x.measure = "fpr")
plot(prf)

auc <- performance(pr, measure = "auc")
auc <- auc@y.values[[1]]
auc
