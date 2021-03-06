DrawSensSpecLR <- function(uniquekey, sensref, specref,sensitivity,specificity, names) {
  file<-paste("./tmp/", uniquekey, "SensSpecLR.jpg")
  graphfile<-gsub("\\s", "", file)
  png(graphfile)
  Specificity <- seq(from=0,to=1,by=0.00001)
  LRMinus <- specref/(1-sensref)
  LRPlus <-  sensref/(1-specref)
  LR <- as.vector(c(LRMinus,LRPlus))
  
  Iterations <- 1:length(LR)
  LTY <- Iterations
  
  for(i in Iterations){
    Sensitivity1 <- 1 - Specificity/LRMinus
    Sensitivity2 <- LRPlus*(1 - Specificity)
    if(i==1) {
      par(mar=c(5.1, 4.1, 4.1, 10))
      plot(Sensitivity1~Specificity,type="l",main=c("Sensitivity vs. Specificity","with Likelihood Ratio contours"),xlab="Specificity",ylab="Sensitivity",ylim=c(0,1),xlim=rev(range(Specificity)),lty=LTY[i],col=LTY[i],font.lab=2,font=2,cex.axis=1.15,cex.lab=1.15)
    }
    else {
      lines(y=Sensitivity2, x=Specificity,lty=LTY[i],col=LTY[i])
      points(sensitivity~specificity)
      text(specificity-0.025,sensitivity-0.025,labels=names)
    }
  }
  
  legend(inset=c(-0.5,0),lty=LTY,col=LTY,legend=c(paste("LR-",round(LRMinus,digits=1)),paste("LR+",round(LRPlus,digits=1))),"bottomright",cex=1.15,text.font=2,bty="o",xpd = TRUE,pch=c(1,3),title="Likelihood Ratio (LR)") 
  dev.off()
}